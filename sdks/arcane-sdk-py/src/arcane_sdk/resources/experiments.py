"""Experiments resource."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Iterator

if TYPE_CHECKING:
    from arcane_sdk.client import ArcaneClient


class ExperimentsResource:
    def __init__(self, client: ArcaneClient) -> None:
        self._client = client

    def list(self) -> list[dict[str, Any]]:
        """List all experiments."""
        return self._client._get("/api/public/experiments")

    def get(self, experiment_id: str) -> dict[str, Any]:
        """Get an experiment by ID."""
        return self._client._get(f"/api/public/experiments/{experiment_id}")

    def list_results(
        self,
        experiment_id: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """List experiment results with pagination."""
        return self._client._get(
            f"/api/public/experiments/{experiment_id}/results",
            params=params,
        )

    def list_results_paginated(
        self,
        experiment_id: str,
        *,
        page_size: int = 20,
    ) -> Iterator[dict[str, Any]]:
        """Iterate over all experiment results, page by page (sync)."""
        page = 1
        while True:
            res = self.list_results(
                experiment_id,
                params={"page": page, "limit": page_size},
            )
            for item in res.get("data", []):
                yield item
            pagination = res.get("pagination", {})
            if not pagination.get("hasNextPage", False):
                break
            page += 1

    def create(self, params: dict[str, Any]) -> dict[str, Any]:
        """Create an experiment."""
        return self._client._post("/api/public/experiments", json=params)

    def create_result(
        self,
        experiment_id: str,
        params: dict[str, Any],
    ) -> dict[str, Any]:
        """Create an experiment result."""
        return self._client._post(
            f"/api/public/experiments/{experiment_id}/results",
            json=params,
        )
