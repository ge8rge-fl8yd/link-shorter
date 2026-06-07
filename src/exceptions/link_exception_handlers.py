from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from src.exceptions.link_exceptions import *


def register_link_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(LinkNotFoundException)
    async def link_not_found_handler(request: Request, exc: LinkNotFoundException):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": "Link not found"}
        )

    @app.exception_handler(ShortLinkNotFoundException)
    async def short_link_not_found_handler(request: Request, exc: ShortLinkNotFoundException):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": "Short link not found"}
        )

    @app.exception_handler(NotValidURLException)
    async def short_link_not_found_handler(request: Request, exc: NotValidURLException):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Not valid url"}
        )
 