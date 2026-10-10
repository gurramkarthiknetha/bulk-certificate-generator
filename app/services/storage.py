"""Storage backends for certificate PDF files."""

import os
from abc import ABC, abstractmethod
from functools import lru_cache
from pathlib import Path

from app.core.config import get_settings


class StorageBackend(ABC):
    """Abstract storage backend interface."""

    @abstractmethod
    async def save(self, key: str, data: bytes) -> str:
        """Save data and return the storage key."""
        ...

    @abstractmethod
    async def get(self, key: str) -> bytes | None:
        """Retrieve data by key."""
        ...

    @abstractmethod
    async def delete(self, key: str) -> bool:
        """Delete data by key."""
        ...

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Check if a key exists."""
        ...


class LocalStorage(StorageBackend):
    """Local filesystem storage backend."""

    def __init__(self, base_path: str = "./storage"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def save(self, key: str, data: bytes) -> str:
        file_path = self.base_path / key
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_bytes(data)
        return key

    async def get(self, key: str) -> bytes | None:
        file_path = self.base_path / key
        if file_path.exists():
            return file_path.read_bytes()
        return None

    async def delete(self, key: str) -> bool:
        file_path = self.base_path / key
        if file_path.exists():
            file_path.unlink()
            return True
        return False

    async def exists(self, key: str) -> bool:
        return (self.base_path / key).exists()


@lru_cache
def get_storage() -> StorageBackend:
    """Get the configured storage backend."""
    settings = get_settings()
    if settings.STORAGE_BACKEND == "local":
        return LocalStorage(settings.STORAGE_PATH)
    # S3 can be added here
    return LocalStorage(settings.STORAGE_PATH)
