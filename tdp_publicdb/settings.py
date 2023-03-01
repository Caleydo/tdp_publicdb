from pydantic import BaseModel
from visyn_core import manager


class TDPPublicDBSettings(BaseModel):
    dburl: str = "postgresql://publicdb:publicdb@publicdb:5432/publicdb"
    statement_timeout: str = "'5min'"
    statement_timeout_query: str = "set statement_timeout to {}"
    engine: dict = {"pool_pre_ping": True}


def get_settings() -> TDPPublicDBSettings:
    return manager.settings.tdp_publicdb
