"""Experiments resource (async)."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, AsyncIterator

if TYPE_CHECKING:
    from arcane_sdk.client_async import ArcaneClientAsync


class ExperimentsResourceAsync:
    def __init__(self, client: ArcaneClientAsync) -> None:
        self._client = client

    async def list(self) -> list[dict[str, Any]]:
        """List all experiments."""
        return await self._client._get("/api/public/experiments")

    async def get(self, experiment_id: str) -> dict[str, Any]:
        """Get an experiment by ID."""
        return await self._client._get(
            f"/api/public/experiments/{experiment_id}"
        )

    async def list_results(
        self,
        experiment_id: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """List experiment results with pagination."""
        return await self._client._get(
            f"/api/public/experiments/{experiment_id}/results",
            params=params,
        )

    async def list_results_paginated(
        self,
        experiment_id: str,
        *,
        page_size: int = 20,
    ) -> AsyncIterator[dict[str, Any]]:
        """Iterate over all experiment results, page by page (async)."""
        page = 1
        while True:
            res = await self.list_results(
                experiment_id,
                params={"page": page, "limit": page_size},
            )
            for item in res.get("data", []):
                yield item
            pagination = res.get("pagination", {})
            if not pagination.get("hasNextPage", False):
                break
            page += 1

    async def create(self, params: dict[str, Any]) -> dict[str, Any]:
        """Create an experiment."""
        return await self._client._post(
            "/api/public/experiments",
            json=params,
        )

    async def create_result(
        self,
        experiment_id: str,
        params: dict[str, Any],
    ) -> dict[str, Any]:
        """Create an experiment result."""
        return await self._client._post(
            f"/api/public/experiments/{experiment_id}/results",
            json=params,
        )
