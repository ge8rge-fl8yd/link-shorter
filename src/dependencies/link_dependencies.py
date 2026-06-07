from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.db import get_db
from src.services import LinkService


def get_link_service(db: AsyncSession = Depends(get_db)):
    return LinkService(db)
