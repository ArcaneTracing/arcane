"""Shared HTTP client setup."""

from __future__ import annotations

import time
from typing import Any

import httpx

from arcane_sdk.errors import ArcanApiError, ArcanNotFoundError, ArcanUnauthorizedError


def _raise_for_status(response: httpx.Response) -> None:
    """Raise appropriate error for HTTP status."""
    if response.is_success:
        return
    request_id = response.headers.get("x-request-id")
    body = response.json() if response.content else {}
    message = body.get("message", response.reason_phrase or "Unknown API error")
    if response.status_code == 404:
        raise ArcanNotFoundError(message, request_id=request_id)
    if response.status_code == 401:
        raise ArcanUnauthorizedError(message, request_id=request_id)
    raise ArcanApiError(
        message,
        status_code=response.status_code,
        request_id=request_id,
    )


def _retry_request(
    client: httpx.Client | httpx.AsyncClient,
    method: str,
    url: str,
    *,
    max_retries: int = 3,
    **kwargs: Any,
) -> httpx.Response:
    """Sync retry logic for 5xx and network errors."""
    last_error: Exception | None = None
    for attempt in range(max_retries + 1):
        try:
            response = client.request(method, url, **kwargs)
            if response.status_code >= 500 and response.status_code < 600:
                last_error = ArcanApiError(
                    response.text or "Server error",
                    status_code=response.status_code,
                )
                if attempt < max_retries:
                    time.sleep(2**attempt)
                    continue
                raise last_error
            return response
        except (httpx.ConnectError, httpx.ReadTimeout) as e:
            last_error = e
            if attempt < max_retries:
                time.sleep(2**attempt)
                continue
            raise ArcanApiError(str(e)) from e
    assert last_error is not None
    raise last_error


async def _retry_request_async(
    client: httpx.AsyncClient,
    method: str,
    url: str,
    *,
    max_retries: int = 3,
    **kwargs: Any,
) -> httpx.Response:
    """Async retry logic for 5xx and network errors."""
    last_error: Exception | None = None
    for attempt in range(max_retries + 1):
        try:
            response = await client.request(method, url, **kwargs)
            if response.status_code >= 500 and response.status_code < 600:
                last_error = ArcanApiError(
                    response.text or "Server error",
                    status_code=response.status_code,
                )
                if attempt < max_retries:
                    await _async_sleep(2**attempt)
                    continue
                raise last_error
            return response
        except (httpx.ConnectError, httpx.ReadTimeout) as e:
            last_error = e
            if attempt < max_retries:
                await _async_sleep(2**attempt)
                continue
            raise ArcanApiError(str(e)) from e
    assert last_error is not None
    raise last_error


async def _async_sleep(seconds: float) -> None:
    """Async sleep (avoids top-level asyncio import)."""
    import asyncio
    await asyncio.sleep(seconds)
