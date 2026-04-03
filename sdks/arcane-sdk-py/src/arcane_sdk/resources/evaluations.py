"""Evaluations resource."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from arcane_sdk.client import ArcaneClient


class EvaluationsResource:
    def __init__(self, client: ArcaneClient) -> None:
        self._client = client

    def list(self) -> list[dict[str, Any]]:
        """List all evaluations."""
        return self._client._get("/api/public/evaluations")

    def get(self, evaluation_id: str) -> dict[str, Any]:
        """Get an evaluation by ID."""
        return self._client._get(f"/api/public/evaluations/{evaluation_id}")

    def get_experiment_scores(
        self,
        evaluation_id: str,
        experiment_id: str,
    ) -> dict[str, Any]:
        """Get experiment scores for an evaluation."""
        return self._client._get(
            f"/api/public/evaluations/{evaluation_id}/experiments/{experiment_id}/scores"
        )

    def create(self, params: dict[str, Any]) -> dict[str, Any]:
        """Create an evaluation."""
        return self._client._post("/api/public/evaluations", json=params)

    def create_result(
        self,
        evaluation_id: str,
        params: dict[str, Any],
    ) -> dict[str, Any]:
        """Create an evaluation result (manual scoring)."""
        return self._client._post(
            f"/api/public/evaluations/{evaluation_id}/results",
            json=params,
        )
