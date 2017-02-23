/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

//register all extensions in the registry following the given pattern
module.exports = function(registry) {
  //registry.push('extension-type', 'extension-id', function() { return System.import('./src/extension_impl'); }, {});
  // generator-phovea:begin

  registry.push('idTypeDetector', 'cellLineIDTypeDetector', function () {
    return System.import('./src/IDTypeDetector');
  }, {
    'factory': 'create',
    'name': 'Cell Line IDType Detector',
    'idType': 'Cellline',
    'options': {
      'entity_name': 'celllinename',
      'schema': 'cellline',
      'table_name': 'cellline'
    }
  });

  registry.push('idTypeDetector', 'tissueIDTypeDetector', function () {
    return System.import('./src/IDTypeDetector');
  }, {
    'factory': 'create',
    'name': 'Tissue IDType Detector',
    'idType': 'Tissue',
    'options': {
      'entity_name': 'tissuename',
      'schema': 'tissue',
      'table_name': 'tissue'
    }
  });

  // generator-phovea:end
};

