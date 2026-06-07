import json
from typing import Any, Optional
import redis.asyncio as aioredis
from pydantic import BaseModel


class CacheService:
    def __init__(self, url: str):
        self._redis = aioredis.Redis.from_url(url, decode_responses=True)

    async def set(self, key: str, value: Any, expire_seconds: int = 3600) -> None:
        if isinstance(value, BaseModel):
            value = value.model_dump()
        if isinstance(value, (dict, list)):
            prepared_value = json.dumps(value)
        else:
            prepared_value = str(value)
        await self._redis.setex(key, expire_seconds, prepared_value)

    async def get(self, key: str) -> Optional[Any]:
        raw_data = await self._redis.get(key)
        if not raw_data:
            return None
        try:
            return json.loads(raw_data)
        except (json.JSONDecodeError, TypeError):
            return raw_data
            
    async def delete(self, *keys: str) -> None:
        if keys:
            await self._redis.delete(*keys)