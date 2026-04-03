"""Datasources resource."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from arcane_sdk.client import ArcaneClient


class DatasourcesResource:
    def __init__(self, client: ArcaneClient) -> None:
        self._client = client

    def list(self) -> list[dict[str, Any]]:
        """List all datasources."""
        return self._client._get("/api/public/datasources")
