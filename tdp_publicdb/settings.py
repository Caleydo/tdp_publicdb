from typing import Dict
from pydantic import BaseSettings
from tdp_core.settings.model import get_global_settings


class TDPPublicDBSettings(BaseSettings):
    dburl: str = "postgresql://publicdb:publicdb@publicdb:5432/publicdb"
    statement_timeout: str = "'5min'"
    statement_timeout_query: str = "set statement_timeout to {}"
    engine: Dict = {
        "pool_pre_ping": True
    }


def get_settings() -> TDPPublicDBSettings:
    return get_global_settings().tdp_publicdb
