"""Request/response logging middleware."""

# Standard library imports
import logging
import time

# 3rd party imports
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("p2p_journal.access")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Logs every request with IP, method, path, status code, and elapsed time."""

    async def dispatch(self, request: Request, call_next) -> Response:
        """Process the request, log details, and re-raise any unhandled exceptions."""
        start = time.perf_counter()
        client_ip = request.client.host if request.client else "unknown"
        try:
            response = await call_next(request)
            elapsed_ms = (time.perf_counter() - start) * 1000
            logger.info(
                "%s %s %s %s %.1fms",
                client_ip,
                request.method,
                request.url.path,
                response.status_code,
                elapsed_ms,
            )
            return response
        except Exception as exc:
            elapsed_ms = (time.perf_counter() - start) * 1000
            logger.exception(
                "%s %s %s ERROR %.1fms — %s",
                client_ip,
                request.method,
                request.url.path,
                elapsed_ms,
                exc,
            )
            raise
