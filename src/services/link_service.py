from src.repositories import LinkRepository, ShortLinkRepository, UserRepository
from sqlalchemy.ext.asyncio import AsyncSession
from src.schemas import LinkSchema, RedirectLinkSchema
from src.exceptions.link_exceptions import *
from src.models import ShortLinkModel
from src.cache import CacheService
from src.core import settings
from src.utils import is_valid_url


class LinkService:
    def __init__(self, db: AsyncSession):
        self.link_repo = LinkRepository(db=db)
        self.short_link_repo = ShortLinkRepository(db=db)
        self.user_repo = UserRepository(db=db)
        self.cache = CacheService(settings.REDIS_URL)
        self.db = db

    async def create_link(self, link: str, user_id: str) -> LinkSchema:
        if not is_valid_url(link):
            raise NotValidURLException()
        
        link_obj = await self.link_repo.get_first(link=link)
        if not link_obj:
            link_obj = await self.link_repo.create(link=link)
            await self.db.flush()
            
        short_link = await self.short_link_repo.create(link_id=link_obj.id, user_id=user_id)
        await self.db.flush()
        await self.db.commit()
        
        await self.cache.set(short_link.slug, link) 
        await self.cache.set(f"{short_link.slug}:{user_id}:data", LinkSchema(link=link, slug=short_link.slug, clicks=short_link.clicks).model_dump())
        
        return LinkSchema(link=link, slug=short_link.slug, clicks=short_link.clicks)
    
    async def get_link_data(self, slug: str, user_id: str) -> LinkSchema:
        data = await self.cache.get(f"{slug}:{user_id}:data")
        if data:
            return LinkSchema.model_validate(data)
        short_link = await self.short_link_repo.get_first(slug=slug, user_id=user_id)
        if not short_link:
            raise ShortLinkNotFoundException()
        link = await self.link_repo.get_by_pk(pk=short_link.link_id)
        if not link:
            raise LinkNotFoundException()
        return LinkSchema(link=link.link, slug=short_link.slug, clicks=short_link.clicks)
    
    async def get_user_links(self, user_id: str, offset: int | None = None, limit: int | None = None) -> list[LinkSchema]:
        short_links = await self.short_link_repo.get_all(user_id=user_id, order_by=ShortLinkModel.clicks.desc(), offset=offset, limit=limit)
        links: list[LinkSchema] = []
        for sl in short_links:
            data = await self.cache.get(f"{sl.slug}:{user_id}:data")
            if data:
                links.append(LinkSchema.model_validate(data))
                continue
            link_obj = await self.link_repo.get_by_pk(pk=sl.link_id)
            if not link_obj:
                continue
            schema_data = LinkSchema(
                link=link_obj.link, 
                slug=sl.slug,
                clicks=sl.clicks
            )
            links.append(schema_data)
            await self.cache.set(f"{sl.slug}:{user_id}:data", schema_data)
        
        return links
    
    async def redirect_to_link(self, slug: str) -> RedirectLinkSchema:
        link = await self.cache.get(slug) 
        if link:
            short_link = await self.short_link_repo.get_by_pk(pk=slug) 
            if short_link:
                await self.cache.delete(f"{slug}:{short_link.user_id}:data")
                short_link.clicks += 1
                await self.db.commit()
            return RedirectLinkSchema(link=link)

        short_link = await self.short_link_repo.get_by_pk(pk=slug)
        if not short_link:
            raise ShortLinkNotFoundException()
            
        link_obj = await self.link_repo.get_by_pk(pk=short_link.link_id)
        if not link_obj:
            raise LinkNotFoundException()
            
        link = link_obj.link

        await self.cache.set(slug, link) 
        
        short_link.clicks += 1
        await self.db.commit()
        return RedirectLinkSchema(link=link)
    
    async def delete_short_link(self, user_id: str, slug: str) -> dict[str, str]:
        short_link = await self.short_link_repo.get_first(slug=slug, user_id=user_id)
        if not short_link:
            raise ShortLinkNotFoundException()
        await self.short_link_repo.delete(pk=slug) 
        await self.db.commit()
        await self.cache.delete(slug)
        await self.cache.delete(f"{slug}:{user_id}:data")
        
        return {'status': 'link deleted successfully'}
