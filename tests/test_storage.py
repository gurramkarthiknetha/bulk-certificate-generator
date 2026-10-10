"""Tests for LocalStorage backend."""

import pytest
import tempfile
import shutil
from pathlib import Path
from app.services.storage import LocalStorage


@pytest.fixture
def temp_storage():
    tmp_dir = tempfile.mkdtemp()
    storage = LocalStorage(tmp_dir)
    yield storage
    shutil.rmtree(tmp_dir)


@pytest.mark.asyncio
async def test_storage_save_and_get(temp_storage):
    """Verify storing and retrieving binary payload."""
    test_data = b"PDF-BYTE-STREAM-TEST"
    key = "job-1/cert-1.pdf"

    saved_key = await temp_storage.save(key, test_data)
    assert saved_key == key

    retrieved = await temp_storage.get(key)
    assert retrieved == test_data


@pytest.mark.asyncio
async def test_storage_exists_and_delete(temp_storage):
    """Verify existence check and file deletion."""
    test_data = b"DELETE-ME"
    key = "job-2/cert-2.pdf"

    assert await temp_storage.exists(key) is False
    await temp_storage.save(key, test_data)
    assert await temp_storage.exists(key) is True

    deleted = await temp_storage.delete(key)
    assert deleted is True
    assert await temp_storage.exists(key) is False
    assert await temp_storage.get(key) is None
