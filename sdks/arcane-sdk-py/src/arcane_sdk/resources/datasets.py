"""Datasets resource."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Iterator

if TYPE_CHECKING:
    from arcane_sdk.client import ArcaneClient


class DatasetsResource:
    def __init__(self, client: ArcaneClient) -> None:
        self._client = client

    def list(self) -> list[dict[str, Any]]:
        """List all datasets."""
        return self._client._get("/api/public/datasets")

    def get(
        self,
        dataset_id: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Get a dataset by ID with paginated rows.

        Returns metadata (id, name, description, header) plus a page of rows.
        """
        return self._client._get(
            f"/api/public/datasets/{dataset_id}",
            params=params,
        )

    def list_rows_paginated(
        self,
        dataset_id: str,
        *,
        page_size: int = 20,
    ) -> Iterator[dict[str, Any]]:
        """Iterate over all dataset rows, page by page (sync).

        Fetches rows in pages without loading the entire dataset into memory.
        """
        page = 1
        while True:
            res = self.get(
                dataset_id,
                params={"page": page, "limit": page_size},
            )
            for row in res.get("data", []):
                yield row
            pagination = res.get("pagination", {})
            if not pagination.get("hasNextPage", False):
                break
            page += 1

    def add_row(
        self,
        dataset_id: str,
        values: list[str],
    ) -> dict[str, Any]:
        """Add a row to a dataset.

        Values must match the dataset header length.
        """
        return self._client._post(
            f"/api/public/datasets/{dataset_id}/rows",
            json={"values": values},
        )
