from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.core import settings
from src.models import Base
from src.db import engine
from src.api import router_for_links, router_for_auth
from src.exceptions.auth_exception_handlers import register_auth_exception_handlers
from src.exceptions.link_exception_handlers import register_link_exception_handlers
import uvicorn


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(lifespan=lifespan, title='Link Shorter', version=settings.VERSION)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=settings.ALLOW_CREDENTIALS,
    allow_methods=settings.ALLOW_METHODS,
    allow_headers=settings.ALLOW_HEADERS,
)

app.include_router(router_for_auth)
app.include_router(router_for_links)

register_auth_exception_handlers(app)
register_link_exception_handlers(app)

if __name__ == '__main__':
    uvicorn.run(app='src.main:app', host=settings.HOST, port=settings.PORT, reload=settings.RELOAD)
