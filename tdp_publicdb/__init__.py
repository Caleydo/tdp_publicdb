###############################################################################
# Caleydo - Visualization for Molecular Biology - http://caleydo.org
# Copyright (c) The Caleydo Team. All rights reserved.
# Licensed under the new BSD license, available at http://caleydo.org/license
###############################################################################


def phovea(registry):
  """
  register extension points
  :param registry:
  """
  # generator-phovea:begin
  registry.append('tdp-sql-database-definition', 'publicdb', 'tdp_publicdb.sql', dict(configKey='tdp_publicdb'))

  from os import path
  registry.append('tdp-sql-database-migration', 'tdp_publicdb', '', {
    'scriptLocation': path.join(path.abspath(path.dirname(__file__)), 'migration'),
    'configKey': 'tdp_publicdb.migration',
    'dbKey': 'publicdb'
  })
  # generator-phovea:end
  pass


def phovea_config():
  """
  :return: file pointer to config file
  """
  from os import path
  here = path.abspath(path.dirname(__file__))
  config_file = path.join(here, 'config.json')
  return config_file if path.exists(config_file) else None
