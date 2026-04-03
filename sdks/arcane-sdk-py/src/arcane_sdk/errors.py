"""API error types."""


class ArcanApiError(Exception):
    """Base API error."""

    def __init__(
        self,
        message: str,
        *,
        status_code: int | None = None,
        request_id: str | None = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.request_id = request_id


class ArcanNotFoundError(ArcanApiError):
    """Resource not found (404)."""

    def __init__(self, message: str, *, request_id: str | None = None):
        super().__init__(message, status_code=404, request_id=request_id)


class ArcanUnauthorizedError(ArcanApiError):
    """Unauthorized (401)."""

    def __init__(self, message: str, *, request_id: str | None = None):
        super().__init__(message, status_code=401, request_id=request_id)
