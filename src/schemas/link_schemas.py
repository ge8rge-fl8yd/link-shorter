from . import BaseSchema
from pydantic import Field

class LinkCreateSchema(BaseSchema):
    link: str

class LinkSchema(LinkCreateSchema):
    slug: str
    clicks: int = Field(default=0, ge=0)

class RedirectLinkSchema(LinkCreateSchema):
    ...