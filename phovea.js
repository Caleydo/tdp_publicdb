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
      'sampleType': 'Cellline'
    }
  });

  registry.push('idTypeDetector', 'tissueIDTypeDetector', function () {
    return System.import('./src/IDTypeDetector');
  }, {
    'factory': 'create',
    'name': 'Tissue IDType Detector',
    'idType': 'Tissue',
    'options': {
      'sampleType': 'Tissue'
    }
  });


  registry.push('targidView', 'celllinedb_onco_print', function () {
    return System.import('./src/views/OncoPrint');
  }, {
    'name': 'OncoPrint',
    'factory': 'create',
    'idtype': 'Ensembl',
    'selection': 'some',
    'group': {
      'name': 'Sample overview',
      'order': 40
    }
  });

  registry.push('targidView', 'celllinedb_expression_vs_copynumber', function () {
    return System.import('./src/views/ExpressionVsCopyNumber');
  }, {
    'name': 'Expression vs. Copy Number',
    'factory': 'create',
    'idtype': 'Ensembl',
    'selection': 'small_multiple',
    'group': {
      'name': 'Visualization',
      'order': 10
    }
  });

  registry.push('targidView', 'celllinedb_co_expression', function () {
    return System.import('./src/views/CoExpression');
  }, {
    'name': 'Co-Expression',
    'factory': 'create',
    'idtype': 'Ensembl',
    'selection': 'small_multiple',
    'group': {
      'name': 'Visualization',
      'order': 0
    }
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
    'selection': 'none'
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
    "sampleType": "Tissue"
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
    'selection': 'none'
  });

  //views

  registry.push('targidView', 'expressiontable', function () {
    return System.import('./src/views/DependentSampleTable');
  }, {
    'name': 'Expression',
    'factory': 'createExpressionTable',
    'idtype': 'Ensembl',
    'selection': 'some',
    'group': {
      'name': 'Sample overview',
      'order': 10
    }
  });

  registry.push('targidView', 'copynumbertable', function () {
    return System.import('./src/views/DependentSampleTable');
  }, {
    'name': 'Copy Number',
    'factory': 'createCopyNumberTable',
    'idtype': 'Ensembl',
    'selection': 'some',
    'group': {
      'name': 'Sample overview',
      'order': 0
    }
  });

  registry.push('targidView', 'mutationtable', function () {
    return System.import('./src/views/DependentSampleTable');
  }, {
    'name': 'Mutation',
    'factory': 'createMutationTable',
    'idtype': 'Ensembl',
    'selection': 'some',
    'group': {
      'name': 'Sample overview',
      'order': 20
    }
  });

  registry.push('targidView', 'celllline_inverted_expressiontable', function () {
    return System.import('./src/views/DependentGeneTable');
  }, {
    'name': 'Expression',
    'factory': 'createExpressionTable',
    'idtype': 'Cellline',
    'selection': 'some',
    'group': {
      'name': 'Gene overview',
      'order': 10
    }
  });

  registry.push('targidView', 'celllline_inverted_copynumbertable', function () {
    return System.import('./src/views/DependentGeneTable');
  }, {
    'name': 'Copy Number',
    'factory': 'createCopyNumberTable',
    'idtype': 'Cellline',
    'selection': 'some',
    'group': {
      'name': 'Gene overview',
      'order': 0
    }
  });

  registry.push('targidView', 'celllline_inverted_mutationtable', function () {
    return System.import('./src/views/DependentGeneTable');
  }, {
    'name': 'Mutation',
    'factory': 'createMutationTable',
    'idtype': 'Cellline',
    'selection': 'some',
    'group': {
      'name': 'Gene overview',
      'order': 20
    }
  });

  registry.push('targidView', 'tissue_inverted_expressiontable', function () {
    return System.import('./src/views/DependentGeneTable');
  }, {
    'name': 'Expression',
    'factory': 'createExpressionTable',
    'idtype': 'Tissue',
    'sampleType': 'Tissue',
    'selection': 'some',
    'group': {
      'name': 'Gene overview',
      'order': 20
    }
  });

  registry.push('targidView', 'tissue_inverted_copynumbertable', function () {
    return System.import('./src/views/DependentGeneTable');
  }, {
    'name': 'Copy Number',
    'factory': 'createCopyNumberTable',
    'idtype': 'Tissue',
    'sampleType': 'Tissue',
    'selection': 'some',
    'group': {
      'name': 'Gene overview',
      'order': 0
    }
  });

  registry.push('targidView', 'tissue_inverted_mutationtable', function () {
    return System.import('./src/views/DependentGeneTable');
  }, {
    'name': 'Mutation',
    'factory': 'createMutationTable',
    'idtype': 'Tissue',
    'sampleType': 'Tissue',
    'selection': 'some',
    'group': {
      'name': 'Gene overview',
      'order': 20
    }
  });

  //scores

  //gene_(Tissue|Celline)
  ['Tissue', 'Cellline'].forEach(function(oppositeIDType)  {
    prefix = 'gene_' + oppositeIDType.toLowerCase();
    registry.push('ordinoScore', prefix + '_aggregated_score', function () {
      return System.import('./src/scores');
    }, {
      'name': 'Aggregated ' + oppositeIDType + ' Score',
      'idtype': 'Ensembl',
      'primaryType': 'Ensembl',
      'oppositeType': oppositeIDType
    });
    registry.push('ordinoScoreImpl', prefix + '_aggregated_score', function () {
      return System.import('./src/scores');
    }, {
      'factory': 'createScore',
      'primaryType': 'Ensembl',
      'oppositeType': oppositeIDType
    });
    registry.push('ordinoScore', prefix + '_single_score', function () {
      return System.import('./src/scores/SingleScore');
    }, {
      'name': 'Single ' + oppositeIDType + ' Score',
      'idtype': 'Ensembl',
      'primaryType': 'Ensembl',
      'oppositeType': oppositeIDType
    });
    registry.push('ordinoScoreImpl', prefix + '_single_score', function () {
      return System.import('./src/scores/SingleScore');
    }, {
      'factory': 'createScore',
      'primaryType': 'Ensembl',
      'oppositeType': oppositeIDType
    });
  });

  //(Tissue|Celline)_gene scores
  ['Tissue', 'Cellline'].forEach(function(idType)  {
    prefix = idType.toLowerCase()+'_gene';
    registry.push('ordinoScore', prefix + '_aggregated_score', function () {
      return System.import('./src/scores');
    }, {
      'name': 'Aggregated Score',
      'idtype': idType,
      'primaryType': idType,
      'oppositeType': 'Ensembl'
    });
    registry.push('ordinoScoreImpl', prefix + '_aggregated_score', function () {
      return System.import('./src/scores');
    }, {
      'factory': 'createScore',
      'primaryType': idType,
      'oppositeType': 'Ensembl'
    });
    registry.push('ordinoScore', prefix + '_single_score', function () {
      return System.import('./src/scores/SingleScore');
    }, {
      'name': 'Single Gene Score',
      'idtype': idType,
      'primaryType': idType,
      'oppositeType': 'Ensembl'
    });
    registry.push('ordinoScoreImpl', prefix + '_single_score', function () {
      return System.import('./src/scores/SingleScore');
    }, {
      'factory': 'createScore',
      'primaryType': idType,
      'oppositeType': 'Ensembl'
    });
  });

  registry.push('targidView', 'clip', function () {
    return System.import('targid_common/src/views/GeneProxyView');
  }, {
    'name': 'CLIP',
    'site': '//vie-toolbox/clip/multiViewGene.php?ensg={gene}',
    'argument': 'gene',
    'idtype': 'Ensembl',
    'selection': 'multiple',
    'group': {
      'name': 'Internal resources',
      'order': 0
    }
  });

  registry.push('targidView', 'clip_cellline', function () {
    return System.import('ordino/src/ProxyView');
  }, {
    'name': 'CLIP',
    'site': '///vie-toolbox/clip/multiViewCellline.php?celllinename={cellline}',
    'argument': 'cellline',
    'idtype': 'Cellline',
    'selection': 'multiple',
    'group': {
      'name': 'Internal resources',
      'order': 0
    }
  });

  registry.push('targidView', 'shiny_cellline', function () {
    return System.import('ordino/src/ProxyView');
  }, {
    'name': 'Copy Number Plots',
    'site': '///vie-bio-shiny.eu.boehringer.com/copynumberoverview/?celllinename={cellline}',
    'argument': 'cellline',
    'idtype': 'Cellline',
    'selection': 'multiple',
    'group': {
      'name': 'Internal resources',
      'order': 10
    }
  });

  registry.push('chooserConfig', 'chooser_header_order', function() {

  }, {
    order: {
      'General': 5,
      'Sample overview': 10,
      'Gene overview': 20,
      'Visualization': 30,
      'Internal resources': 40,
      'External resources': 50,
      'Other': 100
    }
  });

  registry.push('targidView', 'gene_generic_detail_view', function () {
    return System.import('./src/views/InfoTable.ts');
  }, {
    'name': 'Database Info',
    'factory': 'createGeneInfoTable',
    'idtype': 'Ensembl',
    'selection': 'multiple',
    'group': {
      'name': 'General',
      'order': 0
    }
  });

  registry.push('targidView', 'cellline_generic_detail_view', function () {
    return System.import('./src/views/InfoTable.ts');
  }, {
    'name': 'Database Info',
    'factory': 'createCelllineInfoTable',
    'idtype': 'Cellline',
    'selection': 'multiple',
    'group': {
      'name': 'General',
      'order': 0
    }
  });

  registry.push('targidView', 'tissue_generic_detail_view', function () {
    return System.import('./src/views/InfoTable.ts');
  }, {
    'name': 'Database Info',
    'factory': 'createTissueInfoTable',
    'idtype': 'Tissue',
    'selection': 'multiple',
    'group': {
      'name': 'General',
      'order': 0
    }
  });

  registry.push('targidView', 'pubmed', function () {
    return System.import('./src/views/GeneSymbolProxyView');
  }, {
    'name': 'PubMed',
    'site': '//www.ncbi.nlm.nih.gov/pubmed?term={gene}',
    'argument': 'gene',
    'idtype': 'Ensembl',
    'selection': 'multiple',
    'group': {
      'name': 'External resources',
      'order': 60
    }
  });
  // generator-phovea:end
};

