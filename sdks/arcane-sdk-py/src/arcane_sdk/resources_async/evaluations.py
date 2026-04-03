"""Evaluations resource (async)."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, AsyncIterator

if TYPE_CHECKING:
    from arcane_sdk.client_async import ArcaneClientAsync


class EvaluationsResourceAsync:
    def __init__(self, client: ArcaneClientAsync) -> None:
        self._client = client

    async def list(self) -> list[dict[str, Any]]:
        """List all evaluations."""
        return await self._client._get("/api/public/evaluations")

    async def get(self, evaluation_id: str) -> dict[str, Any]:
        """Get an evaluation by ID."""
        return await self._client._get(
            f"/api/public/evaluations/{evaluation_id}"
        )

    async def get_experiment_scores(
        self,
        evaluation_id: str,
        experiment_id: str,
    ) -> dict[str, Any]:
        """Get experiment scores for an evaluation."""
        return await self._client._get(
            f"/api/public/evaluations/{evaluation_id}/experiments/{experiment_id}/scores"
        )

    async def create(self, params: dict[str, Any]) -> dict[str, Any]:
        """Create an evaluation."""
        return await self._client._post(
            "/api/public/evaluations",
            json=params,
        )

    async def create_result(
        self,
        evaluation_id: str,
        params: dict[str, Any],
    ) -> dict[str, Any]:
        """Create an evaluation result (manual scoring)."""
        return await self._client._post(
            f"/api/public/evaluations/{evaluation_id}/results",
            json=params,
        )

    async def list_pending_score_results(
        self,
        evaluation_id: str,
        score_id: str,
        *,
        experiment_id: str | None = None,
        page: int = 1,
        limit: int = 100,
    ) -> dict[str, Any]:
        """
        List pending score results for a manual score (status PENDING).
        For dataset-scoped evaluations: omit experiment_id.
        For experiment-scoped evaluations: pass experiment_id.
        Returns paginated results.
        """
        params: dict[str, Any] = {"page": page, "limit": limit}
        if experiment_id is not None:
            params["experimentId"] = experiment_id
        return await self._client._get(
            f"/api/public/evaluations/{evaluation_id}/scores/{score_id}/pending-results",
            params=params,
        )

    async def list_pending_score_results_iterator(
        self,
        evaluation_id: str,
        score_id: str,
        *,
        experiment_id: str | None = None,
        limit: int = 100,
    ) -> AsyncIterator[dict[str, Any]]:
        """
        Iterate over all pending score results for a manual score.
        For dataset scope: omit experiment_id.
        For experiment scope: pass experiment_id.
        """
        page = 1
        while True:
            res = await self.list_pending_score_results(
                evaluation_id,
                score_id,
                experiment_id=experiment_id,
                page=page,
                limit=limit,
            )
            for item in res.get("data", []):
                yield item
            pagination = res.get("pagination", {})
            if not pagination.get("hasNextPage", False):
                break
            page += 1

    async def import_score_results(
        self,
        evaluation_id: str,
        score_id: str,
        results: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """
        Import/update score results (bulk).
        For dataset scope: use datasetRowId per row.
        For experiment scope: use experimentResultId per row.
        Upserts existing PENDING results or creates new ones.
        Each row: {"datasetRowId"?: str, "experimentResultId"?: str, "value": number, "reasoning"?: str}
        """
        return await self._client._post(
            f"/api/public/evaluations/{evaluation_id}/scores/{score_id}/import-results",
            json={"results": results},
        )
