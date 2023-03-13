###############################################################################
# Caleydo - Visualization for Molecular Biology - http://caleydo.org
# Copyright (c) The Caleydo Team. All rights reserved.
# Licensed under the new BSD license, available at http://caleydo.org/license
###############################################################################
from pydantic import BaseModel
from visyn_core.plugin.model import AVisynPlugin, RegHelper

from .settings import TDPPublicDBSettings


class VisynPlugin(AVisynPlugin):
    def register(self, registry: RegHelper):
        registry.append("tdp-sql-database-definition", "publicdb", "tdp_publicdb.sql", {"configKey": "tdp_publicdb"})

        registry.append(
            "tdp_proxy",
            "genehopper_similar",
            "",
            {"name": "Gene Hopper Similar Genes Proxy", "url": "http://genehopper.ifis.cs.tu-bs.de/rest/similargenes?q={gene}"},
        )

        from os import path

        registry.append(
            "tdp-sql-database-migration",
            "tdp_publicdb",
            "",
            {
                "scriptLocation": path.join(path.abspath(path.dirname(__file__)), "migration"),
                "configKey": "tdp_publicdb.migration",
                "dbKey": "publicdb",
                "autoUpgrade": False,
            },
        )

    @property
    def setting_class(self) -> type[BaseModel]:
        return TDPPublicDBSettings
