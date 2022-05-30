from typing import Dict

from pydantic import BaseModel
from tdp_core import manager


class TDPPublicDBSettings(BaseModel):
    dburl: str = "postgresql://publicdb:publicdb@publicdb:5432/publicdb"
    statement_timeout: str = "'5min'"
    statement_timeout_query: str = "set statement_timeout to {}"
    engine: Dict = {"pool_pre_ping": True}


def get_settings() -> TDPPublicDBSettings:
    return manager.settings.tdp_publicdb
