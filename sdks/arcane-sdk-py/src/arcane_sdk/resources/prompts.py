"""Prompts resource."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from arcane_sdk.client import ArcaneClient


class PromptsResource:
    def __init__(self, client: ArcaneClient) -> None:
        self._client = client

    def list(self) -> list[dict[str, Any]]:
        """List all prompts."""
        res = self._client._get("/api/public/prompts")
        return res.get("data", res)

    def get(self, prompt_identifier: str) -> dict[str, Any]:
        """Get a prompt by ID or name."""
        res = self._client._get(f"/api/public/prompts/{prompt_identifier}")
        return res.get("data", res)

    def list_versions(self, prompt_identifier: str) -> list[dict[str, Any]]:
        """List versions of a prompt."""
        res = self._client._get(f"/api/public/prompts/{prompt_identifier}/versions")
        return res.get("data", res)

    def get_latest_version(self, prompt_identifier: str) -> dict[str, Any]:
        """Get the latest version of a prompt."""
        res = self._client._get(f"/api/public/prompts/{prompt_identifier}/latest")
        return res.get("data", res)
