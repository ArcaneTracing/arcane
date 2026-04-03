"""Traces resource."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from arcane_sdk.client import ArcaneClient


class TracesResource:
    def __init__(self, client: ArcaneClient) -> None:
        self._client = client

    def search(
        self,
        datasource_id: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Search traces for a datasource."""
        return self._client._post(
            f"/api/public/datasources/{datasource_id}/traces/search",
            json=params or {},
        )

    def get(self, datasource_id: str, trace_id: str) -> dict[str, Any]:
        """Get a trace by ID."""
        return self._client._get(
            f"/api/public/datasources/{datasource_id}/traces/{trace_id}"
        )

    def get_attribute_names(self, datasource_id: str) -> list[str]:
        """Get attribute names for a datasource."""
        return self._client._get(
            f"/api/public/datasources/{datasource_id}/traces/attributes"
        )

    def get_attribute_values(
        self,
        datasource_id: str,
        attribute_name: str,
    ) -> list[str]:
        """Get attribute values for a given attribute name."""
        return self._client._get(
            f"/api/public/datasources/{datasource_id}/traces/attributes/{attribute_name}/values"
        )
