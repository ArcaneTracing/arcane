"""Entities resource (async)."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from arcane_sdk.client_async import ArcanClientAsync


class EntitiesResourceAsync:
    def __init__(self, client: ArcanClientAsync) -> None:
        self._client = client

    async def list(self) -> list[dict[str, Any]]:
        """List all entities."""
        return await self._client._get("/api/public/entities")

    async def get(self, entity_id: str) -> dict[str, Any]:
        """Get an entity by ID."""
        return await self._client._get(f"/api/public/entities/{entity_id}")
