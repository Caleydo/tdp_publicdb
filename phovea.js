/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

//register all extensions in the registry following the given pattern
module.exports = function(registry) {
  //registry.push('extension-type', 'extension-id', function() { return System.import('./src/extension_impl'); }, {});
  // generator-phovea:begin


  registry.push('targidView', 'celllinedb_onco_print', function () {
    return System.import('./src/views/OncoPrint');
  }, {
    'name': 'OncoPrint',
    'category': 'dynamic',
    'factory': 'create',
    'idtype': 'Ensembl',
    'selection': 'some'
  });

  registry.push('targidView', 'celllinedb_expression_vs_copynumber', function () {
    return System.import('./src/views/ExpressionVsCopyNumber');
  }, {
    'name': 'Expression vs. Copy Number',
    'category': 'dynamic',
    'factory': 'create',
    'idtype': 'Ensembl',
    'selection': 'small_multiple'
  });

  registry.push('targidView', 'celllinedb_co_expression', function () {
    return System.import('./src/views/CoExpression');
  }, {
    'name': 'Co-Expression',
    'category': 'dynamic',
    'factory': 'create',
    'idtype': 'Ensembl',
    'selection': 'small_multiple'
  });

  // generator-phovea:end
};

