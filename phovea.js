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

  registry.push('targidStartEntryPoint', 'celllinedb_genes_start', function () {
    return System.import('./src/entries/GeneEntryPoint');
  }, {
    'name': 'Genes',
    'factory': 'createStartFactory',
    'viewId': 'celllinedb_start',
    'idtype': 'Ensembl',
    'selection': 'none',
    'description': 'Gene Sets',
    'cssClass': 'gene-entry-point'
  });
  registry.push('targidView', 'celllinedb_start', function () {
    return System.import('./src/entries/GeneEntryPoint');
  }, {
    'name': 'Genes',
    'factory': 'createStart',
    'idtype': 'Ensembl',
    'selection': 'none',
    'dbPath': 'genes_by_names'
  });

  registry.push('targidStartEntryPoint', 'bioinfodb_tissue_start', function () {
    return System.import('./src/entries/CellLineEntryPoint');
  }, {
    'name': 'Tissues',
    'factory': 'createStartFactory',
    'viewId': 'bioinfodb_tissue_start',
    "idtype": "Tissue",
    "selection": "none",
    "sampleType": "Tissue",
    'description': 'Tissue Panels',
    'cssClass': 'tissue-entry-point'
  });
  registry.push('targidView', 'bioinfodb_tissue_start', function () {
    return System.import('./src/entries/CellLineEntryPoint');
  }, {
    'name': 'Tissues',
    'factory': 'createStart',
    "idtype": "Tissue",
    "selection": "none",
    "sampleType": "Tissue",
    'dbPath': 'row'
  });


  registry.push('targidStartEntryPoint', 'celllinedb_cellline_start', function () {
    return System.import('./src/entries/CellLineEntryPoint');
  }, {
    'name': 'Cell Lines',
    'factory': 'createStartFactory',
    'viewId': 'celllinedb_cellline',
    'idtype': 'Cellline',
    'selection': 'none',
    'description': 'Cell Line Panels',
    'cssClass': 'cellline-entry-point'
  });
  registry.push('targidView', 'celllinedb_cellline', function () {
    return System.import('./src/entries/CellLineEntryPoint');
  }, {
    'name': 'Cell Lines',
    'factory': 'createStart',
    'idtype': 'Cellline',
    'selection': 'none',
    'dbPath': 'row'
  });

  //views

  registry.push('__targidView__backup', 'celllinedb_enrichment', function () {
    return System.import('./src/views/Enrichment');
  }, {
    'name': 'Enrichment',
    'category': 'dynamic',
    'idtype': 'Ensembl',
    'selection': 'single',
    'mockup': true
  });


  registry.push('targidView', 'expressiontable', function () {
    return System.import('./src/views/DependentSampleTable');
  }, {
    'name': 'Expression',
    'factory': 'createExpressionTable',
    'idtype': 'Ensembl',
    'selection': 'some'
  });

  registry.push('targidView', 'copynumbertable', function () {
    return System.import('./src/views/DependentSampleTable');
  }, {
    'name': 'Copy Number',
    'factory': 'createCopyNumberTable',
    'idtype': 'Ensembl',
    'selection': 'some'
  });

  registry.push('targidView', 'mutationtable', function () {
    return System.import('./src/views/DependentSampleTable');
  }, {
    'name': 'Mutation',
    'factory': 'createMutationTable',
    'idtype': 'Ensembl',
    'selection': 'some'
  });

  registry.push('targidView', 'celllline_inverted_expressiontable', function () {
    return System.import('./src/views/DependentGeneTable');
  }, {
    'name': 'Expression',
    'factory': 'createExpressionTable',
    'idtype': 'Cellline',
    'selection': 'some'
  });

  registry.push('targidView', 'celllline_inverted_copynumbertable', function () {
    return System.import('./src/views/DependentGeneTable');
  }, {
    'name': 'Copy Number',
    'factory': 'createCopyNumberTable',
    'idtype': 'Cellline',
    'selection': 'some'
  });

  registry.push('targidView', 'celllline_inverted_mutationtable', function () {
    return System.import('./src/views/DependentGeneTable');
  }, {
    'name': 'Mutation',
    'factory': 'createMutationTable',
    'idtype': 'Cellline',
    'selection': 'some'
  });

  registry.push('targidView', 'tissue_inverted_expressiontable', function () {
    return System.import('./src/views/DependentGeneTable');
  }, {
    'name': 'Expression',
    'factory': 'createExpressionTable',
    'idtype': 'Tissue',
    'sampleType': 'Tissue',
    'selection': 'some'
  });

  registry.push('targidView', 'tissue_inverted_copynumbertable', function () {
    return System.import('./src/views/DependentGeneTable');
  }, {
    'name': 'Copy Number',
    'factory': 'createCopyNumberTable',
    'idtype': 'Tissue',
    'sampleType': 'Tissue',
    'selection': 'some'
  });

  registry.push('targidView', 'tissue_inverted_mutationtable', function () {
    return System.import('./src/views/DependentGeneTable');
  }, {
    'name': 'Mutation',
    'factory': 'createMutationTable',
    'idtype': 'Tissue',
    'sampleType': 'Tissue',
    'selection': 'some'
  });

  //scores

  registry.push('ordinoScore', 'gene_aggregated_score', function () {
    return System.import('./src/scores/gene');
  }, {
    'name': 'Score',
    'idtype': 'Ensembl'
  });

  registry.push('ordinoScoreImpl', 'gene_aggregated_score', function () {
    return System.import('./src/scores/gene');
  }, {
    'factory': 'createScore'
  });

  registry.push('ordinoScore', 'cellline_inverted_aggregated_score', function () {
    return System.import('./src/scores/sample');
  }, {
    'name': 'Score',
    'idtype': 'Cellline'
  });
  registry.push('ordinoScore', 'tissue_inverted_aggregated_score', function () {
    return System.import('./src/scores/sample');
  }, {
    'name': 'Score',
    'idtype': 'Tissue',
    'sampleType': 'Tissue'
  });

  registry.push('ordinoScoreImpl', 'tissue_inverted_aggregated_score', function () {
    return System.import('./src/scores/sample');
  }, {
    'factory': 'createScore'
  });

  registry.push('ordinoScoreImpl', 'cellline_inverted_aggregated_score', function () {
    return System.import('./src/scores/sample');
  }, {
    'factory': 'createScore'
  });



  registry.push('targidView', 'clip', function () {
    return System.import('targid_common/src/views/GeneProxyView');
  }, {
    'name': 'CLIP',
    'category': 'static',
    'site': '//vie-toolbox/clip/multiViewGene.php?ensg={gene}',
    'argument': 'gene',
    'idtype': 'Ensembl',
    'selection': 'multiple'
  });

  registry.push('targidView', 'clip_cellline', function () {
    return System.import('ordino/src/ProxyView');
  }, {
    'name': 'CLIP',
    'category': 'static',
    'site': '///vie-toolbox/clip/multiViewCellline.php?celllinename={cellline}',
    'argument': 'cellline',
    'idtype': 'Cellline',
    'selection': 'multiple'
  });

  registry.push('targidView', 'shiny_cellline', function () {
    return System.import('ordino/src/ProxyView');
  }, {
    'name': 'Copy Number Plots',
    'category': 'static',
    'site': '///vie-bio-shiny.eu.boehringer.com/copynumberoverview/?celllinename={cellline}',
    'argument': 'cellline',
    'idtype': 'Cellline',
    'selection': 'multiple'
  });
  // generator-phovea:end
};

