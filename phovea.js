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
    return System.import('./src/CellLineIDTypeDetector');
  }, {
    'factory': 'cellLineIDTypeDetector',
    'name': 'Cell Line IDType Detector',
    'idType': 'Cellline'
  });

  // generator-phovea:end
};

