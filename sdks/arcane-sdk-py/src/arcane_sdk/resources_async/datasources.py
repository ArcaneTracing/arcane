"""Datasources resource (async)."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from arcane_sdk.client_async import ArcaneClientAsync


class DatasourcesResourceAsync:
    def __init__(self, client: ArcaneClientAsync) -> None:
        self._client = client

    async def list(self) -> list[dict[str, Any]]:
        """List all datasources."""
        return await self._client._get("/api/public/datasources")
