from fastapi import APIRouter, status, Depends
from fastapi.responses import RedirectResponse
from src.dependencies import get_link_service, get_current_user
from src.services import LinkService
from src.schemas import LinkSchema, LinkCreateSchema
from src.models import UserModel

router = APIRouter(prefix='/links', tags=['Link endpoints'])

@router.get('/{slug}', status_code=status.HTTP_302_FOUND)
async def redirect(slug: str, link_service: LinkService = Depends(get_link_service)):
    link = await link_service.redirect_to_link(slug=slug)
    return RedirectResponse(url = link.link)

@router.get('/link_data/{slug}', status_code=status.HTTP_200_OK, response_model=LinkSchema)
async def link_data(slug: str, link_service: LinkService = Depends(get_link_service), user: UserModel = Depends(get_current_user)):
    return await link_service.get_link_data(slug=slug, user_id=user.id)

@router.get('/user_links/', status_code=status.HTTP_200_OK, response_model=list[LinkSchema])
async def user_links(offset: int | None = None, limit: int | None = None, link_service: LinkService = Depends(get_link_service), user: UserModel = Depends(get_current_user)):
    return await link_service.get_user_links(user_id=user.id, offset=offset, limit=limit)

@router.post('/add_link', status_code=status.HTTP_201_CREATED, response_model=LinkSchema)
async def add_link(payload: LinkCreateSchema, link_service: LinkService = Depends(get_link_service), user: UserModel = Depends(get_current_user)):
    return await link_service.create_link(link=payload.link, user_id=user.id)

@router.delete('/delete_link', status_code=status.HTTP_200_OK)
async def delete_link(slug: str, link_service: LinkService = Depends(get_link_service), user: UserModel = Depends(get_current_user)):
    return await link_service.delete_short_link(user_id=user.id, slug=slug)
