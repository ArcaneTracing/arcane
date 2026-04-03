"""Prompts resource (async)."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from arcane_sdk.client_async import ArcaneClientAsync


class PromptsResourceAsync:
    def __init__(self, client: ArcaneClientAsync) -> None:
        self._client = client

    async def list(self) -> list[dict[str, Any]]:
        """List all prompts."""
        res = await self._client._get("/api/public/prompts")
        return res.get("data", res)

    async def get(self, prompt_identifier: str) -> dict[str, Any]:
        """Get a prompt by ID or name."""
        res = await self._client._get(f"/api/public/prompts/{prompt_identifier}")
        return res.get("data", res)

    async def list_versions(self, prompt_identifier: str) -> list[dict[str, Any]]:
        """List versions of a prompt."""
        res = await self._client._get(
            f"/api/public/prompts/{prompt_identifier}/versions"
        )
        return res.get("data", res)

    async def get_latest_version(self, prompt_identifier: str) -> dict[str, Any]:
        """Get the latest version of a prompt."""
        res = await self._client._get(
            f"/api/public/prompts/{prompt_identifier}/latest"
        )
        return res.get("data", res)
