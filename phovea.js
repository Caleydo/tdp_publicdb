/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

//register all extensions in the registry following the given pattern
module.exports = function (registry) {
  //registry.push('extension-type', 'extension-id', function() { return System.import('./src/extension_impl'); }, {});
  // generator-phovea:begin

  /// #if include('ordino')
  registry.push('ordinoStartMenuSubSection', 'celllinedb_genes_start', function () {
    return System.import('./src/entries/GeneEntryPoint');
  }, {
    name: 'Genes',
    factory: 'createStartFactory',
    viewId: 'celllinedb_start',
    idtype: 'Ensembl',
    selection: 'none',
    description: 'Gene Sets',
    cssClass: 'gene-entry-point'
  });

  registry.push('ordinoStartMenuSubSection', 'bioinfodb_tissue_start', function () {
    return System.import('./src/entries/CellLineEntryPoint');
  }, {
    name: 'Tissues',
    factory: 'createStartFactory',
    viewId: 'bioinfodb_tissue_start',
    idtype: 'Tissue',
    selection: 'none',
    sampleType: 'Tissue',
    description: 'Tissue Panels',
    cssClass: 'tissue-entry-point'
  });

  registry.push('ordinoStartMenuSubSection', 'celllinedb_cellline_start', function () {
    return System.import('./src/entries/CellLineEntryPoint');
  }, {
    name: 'Cell Lines',
    factory: 'createStartFactory',
    viewId: 'celllinedb_cellline',
    idtype: 'Cellline',
    selection: 'none',
    description: 'Cell Line Panels',
    cssClass: 'cellline-entry-point'
  });
  /// #endif

  //gene views
  {
    registry.push('tdpView', 'celllinedb_start', function () {
      return System.import('./src/entries/GeneEntryPoint');
    }, {
      name: 'Genes',
      factory: 'createStart',
      idtype: 'Ensembl',
      selection: 'none'
    });

    registry.push('tdpView', 'expressiontable', function () {
      return System.import('./src/views/DependentSampleTable');
    }, {
      name: 'Expression',
      factory: 'createExpressionTable',
      idtype: 'Ensembl',
      selection: 'some',
      group: {
        name: 'Sample overview',
        order: 10
      }
    });

    registry.push('tdpView', 'copynumbertable', function () {
      return System.import('./src/views/DependentSampleTable');
    }, {
      name: 'Copy Number',
      factory: 'createCopyNumberTable',
      idtype: 'Ensembl',
      selection: 'some',
      group: {
        name: 'Sample overview',
        order: 0
      }
    });

    registry.push('tdpView', 'mutationtable', function () {
      return System.import('./src/views/DependentSampleTable');
    }, {
      name: 'Mutation',
      factory: 'createMutationTable',
      idtype: 'Ensembl',
      selection: 'some',
      group: {
        name: 'Sample overview',
        order: 20
      }
    });

    registry.push('tdpView', 'gene_generic_detail_view', function () {
      return System.import('./src/views/InfoTable.ts');
    }, {
      name: 'Database Info',
      factory: 'createGeneInfoTable',
      idtype: 'Ensembl',
      selection: 'multiple',
      group: {
        name: 'General',
        order: 0
      }
    });


    registry.push('tdpView', 'celllinedb_onco_print', function () {
      return System.import('./src/views/OncoPrint');
    }, {
      name: 'OncoPrint',
      factory: 'create',
      idtype: 'Ensembl',
      selection: 'some',
      group: {
        name: 'Sample overview',
        order: 40
      }
    });

    registry.push('tdpView', 'celllinedb_expression_vs_copynumber', function () {
      return System.import('./src/views/ExpressionVsCopyNumber');
    }, {
      name: 'Expression vs. Copy Number',
      factory: 'create',
      idtype: 'Ensembl',
      selection: 'some',
      group: {
        name: 'Visualization',
        order: 10
      }
    });

    registry.push('tdpView', 'celllinedb_co_expression', function () {
      return System.import('./src/views/CoExpression');
    }, {
      name: 'Co-Expression',
      factory: 'create',
      idtype: 'Ensembl',
      selection: 'some',
      group: {
        name: 'Visualization',
        order: 0
      }
    });

    registry.push('tdpView', 'gene_combined_lineup', function () {
      return System.import('./src/views/CombinedDependentSampleTable');
    }, {
      name: 'Combined View',
      factory: 'create',
      idtype: 'Ensembl',
      selection: 'some',
      group: {
        name: 'Sample overview',
        order: 40
      },
      filter: {
        species: 'human'
      }
    });

    /// #if include('uploader')
    registry.push('idTypeDetector', 'geneSymbol', function () {
      return System.import('./src/GeneSymbolDetector');
    }, {
      factory: 'human',
      name: 'GeneSymbol',
      idType: 'GeneSymbol_human',
      options: {
        sampleType: 'GeneSymbol'
      }
    });
    /// #endif

    /// #if include('bob')
    registry.push('bobSearchProvider', 'gene', function () {
      return import('./src/entries/SearchProvider')
    }, {
      factory: 'createGene',
      idType: 'Ensembl',
      name: 'Genes'
    });
    /// #endif
  }


  //views
  ['Tissue', 'Cellline'].forEach(function (idType) {
    const plain = idType.toLowerCase();
    const label = idType === 'Tissue' ? 'Tissues' : 'Cell lines';


    registry.push('tdpView', 'bioinfodb_' + plain + '_start', function () {
      return System.import('./src/entries/CellLineEntryPoint');
    }, {
      name: label,
      factory: 'createStart' + idType,
      idtype: idType,
      selection: 'none',
      sampleType: idType
    });

    registry.push('tdpView', plain + '_inverted_expressiontable', function () {
      return System.import('./src/views/DependentGeneTable');
    }, {
      name: 'Expression',
      factory: 'createExpressionTable',
      idtype: idType,
      sampleType: idType,
      selection: 'some',
      group: {
        name: 'Gene overview',
        order: 20
      }
    });

    registry.push('tdpView', plain + '_inverted_copynumbertable', function () {
      return System.import('./src/views/DependentGeneTable');
    }, {
      name: 'Copy Number',
      factory: 'createCopyNumberTable',
      idtype: idType,
      sampleType: idType,
      selection: 'some',
      group: {
        name: 'Gene overview',
        order: 0
      }
    });

    registry.push('tdpView', plain + '_inverted_mutationtable', function () {
      return System.import('./src/views/DependentGeneTable');
    }, {
      name: 'Mutation',
      factory: 'createMutationTable',
      idtype: idType,
      sampleType: idType,
      selection: 'some',
      group: {
        name: 'Gene overview',
        order: 20
      }
    });

    registry.push('tdpView', plain + '_combined_lineup', function () {
      return System.import('./src/views/CombinedDependentGeneTable');
    }, {
      name: 'Combined View',
      factory: 'new',
      idtype: idType,
      selection: 'some',
      group: {
        name: 'Gene overview',
        order: 40
      },
      filter: {
        species: 'human'
      }
    });

    registry.push('tdpView', plain + '_generic_detail_view', function () {
      return System.import('./src/views/InfoTable.ts');
    }, {
      name: 'Database Info',
      factory: 'create' + idType + 'InfoTable',
      idtype: idType,
      selection: 'multiple',
      group: {
        name: 'General',
        order: 0
      }
    });


    /// #if include('bob')
    registry.push('bobSearchProvider', idType.toLowerCase(), function () {
      return import('./src/entries/SearchProvider')
    }, {
      factory: 'create' + idType,
      idType: idType,
      name: label
    });
    /// #endif


    registry.push('idTypeDetector', plain + 'IDTypeDetector', function () {
      return System.import('./src/IDTypeDetector');
    }, {
      factory: 'create',
      name: label + ' IDType Detector',
      idType: idType,
      options: {
        sampleType: idType
      }
    });
  });

  //scores

  //gene_(Tissue|Celline)
  ['Tissue', 'Cellline'].forEach(function (oppositeIDType) {
    const prefix = 'gene_' + oppositeIDType.toLowerCase();
    registry.push('ordinoScore', prefix + '_aggregated_score', function () {
      return System.import('./src/scores');
    }, {
      name: 'Aggregated ' + oppositeIDType + ' Score',
      idtype: 'Ensembl',
      primaryType: 'Ensembl',
      oppositeType: oppositeIDType
    });
    registry.push('ordinoScoreImpl', prefix + '_aggregated_score', function () {
      return System.import('./src/scores');
    }, {
      factory: 'createScore',
      primaryType: 'Ensembl',
      oppositeType: oppositeIDType
    });
    registry.push('ordinoScore', prefix + '_single_score', function () {
      return System.import('./src/scores/SingleScore');
    }, {
      name: 'Single ' + oppositeIDType + ' Score',
      idtype: 'Ensembl',
      primaryType: 'Ensembl',
      oppositeType: oppositeIDType
    });
    registry.push('ordinoScoreImpl', prefix + '_single_score', function () {
      return System.import('./src/scores/SingleScore');
    }, {
      factory: 'createScore',
      primaryType: 'Ensembl',
      oppositeType: oppositeIDType
    });
  });

  //(Tissue|Celline)_gene scores
  ['Tissue', 'Cellline'].forEach(function (idType) {
    const prefix = idType.toLowerCase() + '_gene';

    registry.push('ordinoScore', prefix + '_aggregated_score', function () {
      return System.import('./src/scores');
    }, {
      name: 'Aggregated Score',
      idtype: idType,
      primaryType: idType,
      oppositeType: 'Ensembl'
    });
    registry.push('ordinoScoreImpl', prefix + '_aggregated_score', function () {
      return System.import('./src/scores');
    }, {
      factory: 'createScore',
      primaryType: idType,
      oppositeType: 'Ensembl'
    });
    registry.push('ordinoScore', prefix + '_single_score', function () {
      return System.import('./src/scores/SingleScore');
    }, {
      name: 'Single Gene Score',
      idtype: idType,
      primaryType: idType,
      oppositeType: 'Ensembl'
    });
    registry.push('ordinoScoreImpl', prefix + '_single_score', function () {
      return System.import('./src/scores/SingleScore');
    }, {
      factory: 'createScore',
      primaryType: idType,
      oppositeType: 'Ensembl'
    });
  });

  registry.push('chooserConfig', 'chooser_header_order', function () {
  }, {
    order: {
      'General': 5,
      'Sample overview': 10,
      'Gene overview': 20,
      'Visualization': 30,
      'Internal resources': 40,
      'External resources': 50,
      'Other': 1000
    }
  });

  registry.push('tdpView', 'pubmed', function () {
    return System.import('./src/views/GeneSymbolProxyView');
  }, {
    name: 'PubMed',
    site: '//www.ncbi.nlm.nih.gov/pubmed?term={gene}',
    argument: 'gene',
    idtype: 'Ensembl',
    selection: 'chooser',
    group: {
      name: 'External resources'
      // order: 60
    }
  });


  // generator-phovea:end
};
