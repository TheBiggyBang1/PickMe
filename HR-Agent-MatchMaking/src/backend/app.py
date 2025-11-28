"""
Compatibility shim that re-exports the FastAPI app from src.backend.api.app
to provide a stable import path (src.backend.app:app) for Uvicorn.
"""

from src.backend.api.app import app  # noqa: F401
