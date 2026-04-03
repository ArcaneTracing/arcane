"""Async Arcan API client."""

from __future__ import annotations

from typing import Any

import httpx

from arcane_sdk._http import _raise_for_status, _retry_request_async
from arcane_sdk.resources_async import (
    DatasourcesResourceAsync,
    DatasetsResourceAsync,
    EntitiesResourceAsync,
    EvaluationsResourceAsync,
    ExperimentsResourceAsync,
    PromptsResourceAsync,
    TracesResourceAsync,
)


class ArcaneClientAsync:
    """Asynchronous client for the Arcane public API."""

    def __init__(
        self,
        *,
        base_url: str,
        api_key: str,
        max_retries: int = 3,
        timeout: float = 30.0,
    ):
        self._base_url = base_url.rstrip("/")
        self._api_key = api_key
        self._max_retries = max_retries
        self._timeout = timeout
        self._client = httpx.AsyncClient(
            base_url=self._base_url,
            auth=("api-key", api_key),
            headers={"Content-Type": "application/json"},
            timeout=timeout,
        )
        self.prompts = PromptsResourceAsync(self)
        self.datasources = DatasourcesResourceAsync(self)
        self.traces = TracesResourceAsync(self)
        self.datasets = DatasetsResourceAsync(self)
        self.entities = EntitiesResourceAsync(self)
        self.evaluations = EvaluationsResourceAsync(self)
        self.experiments = ExperimentsResourceAsync(self)

    async def _request(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        url = path if path.startswith("http") else f"{self._base_url}{path}"
        response = await _retry_request_async(
            self._client,
            method,
            url,
            max_retries=self._max_retries,
            **kwargs,
        )
        _raise_for_status(response)
        return response

    async def _get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        r = await self._request("GET", path, params=params)
        return r.json()

    async def _post(self, path: str, json: Any = None) -> Any:
        r = await self._request("POST", path, json=json)
        return r.json()

    async def close(self) -> None:
        """Close the HTTP client."""
        await self._client.aclose()

    async def __aenter__(self) -> ArcaneClientAsync:
        return self

    async def __aexit__(self, *args: Any) -> None:
        await self.close()
