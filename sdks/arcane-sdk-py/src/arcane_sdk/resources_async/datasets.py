"""Datasets resource (async)."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, AsyncIterator

if TYPE_CHECKING:
    from arcane_sdk.client_async import ArcaneClientAsync


class DatasetsResourceAsync:
    def __init__(self, client: ArcaneClientAsync) -> None:
        self._client = client

    async def list(self) -> list[dict[str, Any]]:
        """List all datasets."""
        return await self._client._get("/api/public/datasets")

    async def get(
        self,
        dataset_id: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Get a dataset by ID with paginated rows.

        Returns metadata (id, name, description, header) plus a page of rows.
        """
        return await self._client._get(
            f"/api/public/datasets/{dataset_id}",
            params=params,
        )

    async def list_rows_paginated(
        self,
        dataset_id: str,
        *,
        page_size: int = 20,
    ) -> AsyncIterator[dict[str, Any]]:
        """Iterate over all dataset rows, page by page (async).

        Fetches rows in pages without loading the entire dataset into memory.
        """
        page = 1
        while True:
            res = await self.get(
                dataset_id,
                params={"page": page, "limit": page_size},
            )
            for row in res.get("data", []):
                yield row
            pagination = res.get("pagination", {})
            if not pagination.get("hasNextPage", False):
                break
            page += 1

    async def add_row(
        self,
        dataset_id: str,
        values: list[str],
    ) -> dict[str, Any]:
        """Add a row to a dataset.

        Values must match the dataset header length.
        """
        return await self._client._post(
            f"/api/public/datasets/{dataset_id}/rows",
            json={"values": values},
        )
