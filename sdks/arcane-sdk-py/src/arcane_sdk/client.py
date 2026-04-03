"""Sync Arcan API client."""

from __future__ import annotations

from typing import Any

import httpx

from arcane_sdk._http import _raise_for_status, _retry_request
from arcane_sdk.resources import (
    DatasourcesResource,
    DatasetsResource,
    EntitiesResource,
    EvaluationsResource,
    ExperimentsResource,
    PromptsResource,
    TracesResource,
)


class ArcaneClient:
    """Synchronous client for the Arcane public API."""

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
        self._client = httpx.Client(
            base_url=self._base_url,
            auth=("api-key", api_key),
            headers={"Content-Type": "application/json"},
            timeout=timeout,
        )
        self.prompts = PromptsResource(self)
        self.datasources = DatasourcesResource(self)
        self.traces = TracesResource(self)
        self.datasets = DatasetsResource(self)
        self.entities = EntitiesResource(self)
        self.evaluations = EvaluationsResource(self)
        self.experiments = ExperimentsResource(self)

    def _request(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        url = path if path.startswith("http") else f"{self._base_url}{path}"
        response = _retry_request(
            self._client,
            method,
            url,
            max_retries=self._max_retries,
            **kwargs,
        )
        _raise_for_status(response)
        return response

    def _get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        r = self._request("GET", path, params=params)
        return r.json()

    def _post(self, path: str, json: Any = None) -> Any:
        r = self._request("POST", path, json=json)
        return r.json()

    def close(self) -> None:
        """Close the HTTP client."""
        self._client.close()

    def __enter__(self) -> ArcaneClient:
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()
