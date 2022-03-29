from typing import Any, Generator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from tdp_core.server.visyn_server import create_visyn_server


@pytest.fixture
def app() -> Generator[FastAPI, Any, None]:
    yield create_visyn_server()


@pytest.fixture(scope="function")
def client(app: FastAPI) -> Generator[TestClient, Any, None]:
    with TestClient(app) as client:
        yield client
