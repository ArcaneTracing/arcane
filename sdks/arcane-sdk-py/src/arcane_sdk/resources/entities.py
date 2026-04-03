"""Entities resource."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from arcane_sdk.client import ArcanClient


class EntitiesResource:
    def __init__(self, client: ArcanClient) -> None:
        self._client = client

    def list(self) -> list[dict[str, Any]]:
        """List all entities."""
        return self._client._get("/api/public/entities")

    def get(self, entity_id: str) -> dict[str, Any]:
        """Get an entity by ID."""
        return self._client._get(f"/api/public/entities/{entity_id}")
