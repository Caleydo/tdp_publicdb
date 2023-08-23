import contextlib
import json

from pydantic import BaseModel, validator
from visyn_core import manager


class TDPPublicDBSettings(BaseModel):
    dburl: str = "postgresql://publicdb:publicdb@publicdb:5432/publicdb"
    statement_timeout: str = "'5min'"
    statement_timeout_query: str = "set statement_timeout to {}"
    engine: dict[str, str] | None = {"pool_pre_ping": True}
    poolclass: str | None = "QueuePool"  # "NullPool" | "QueuePool" | "StaticPool"

    @validator("engine", pre=True)
    def json_decode_headers(cls, v):  # NOQA N805
        # Manually parse JSON strings if they are coming from the env via `VISYN_CORE__...='{"...": ...}'`.
        # See https://github.com/pydantic/pydantic/issues/831 for details.
        if isinstance(v, str):
            with contextlib.suppress(ValueError):
                return json.loads(v)
        return v


def get_settings() -> TDPPublicDBSettings:
    return manager.settings.tdp_publicdb
