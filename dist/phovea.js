/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
import { EP_ORDINO_STARTMENU_DATASET_SECTION } from 'ordino';
import { EP_PHOVEA_CORE_LOCALE, PluginRegistry } from 'phovea_core';
import { gene, cellline, tissue } from './common/config';
//register all extensions in the registry following the given pattern
export default function (registry) {
    //registry.push('extension-type', 'extension-id', function() { return import('./src/extension_impl'); }, {});
    // generator-phovea:begin
    /// #if include('ordino')
    registry.push(EP_ORDINO_STARTMENU_DATASET_SECTION, 'celllinedb_genes_start', () => import('./menu/DatasetCard'), {
        name: 'Genes',
        headerIcon: 'fas fa-database',
        viewId: 'celllinedb_start',
        idType: 'Ensembl',
        dataSource: gene,
        selection: 'none',
        description: 'Gene Sets',
        cssClass: 'gene-entry-point',
        tabs: [
            { id: 'human', tabText: 'Human', tabIcon: 'fas fa-male' },
            { id: 'mouse', tabText: 'Mouse', tabIcon: 'fas fa-fw mouse-icon' }
        ]
    });
    registry.push(EP_ORDINO_STARTMENU_DATASET_SECTION, 'bioinfodb_tissue_start', () => import('./menu/DatasetCard'), {
        name: 'Tissues',
        headerIcon: 'fas fa-database',
        viewId: 'bioinfodb_tissue_start',
        idType: 'Tissue',
        dataSource: tissue,
        selection: 'none',
        sampleType: 'Tissue',
        description: 'Tissue Panels',
        cssClass: 'tissue-entry-point',
        tabs: [
            { id: 'human', tabText: 'Human', tabIcon: 'fas fa-male' },
            { id: 'mouse', tabText: 'Mouse', tabIcon: 'fas fa-fw mouse-icon' }
        ]
    });
    registry.push(EP_ORDINO_STARTMENU_DATASET_SECTION, 'celllinedb_cellline_start', () => import('./menu/DatasetCard'), {
        name: 'Cell Lines',
        headerIcon: 'fas fa-database',
        viewId: 'celllinedb_cellline',
        idType: 'Cellline',
        dataSource: cellline,
        selection: 'none',
        description: 'Cell Line Panels',
        cssClass: 'cellline-entry-point',
        tabs: [
            { id: 'human', tabText: 'Human', tabIcon: 'fas fa-male' },
            { id: 'mouse', tabText: 'Mouse', tabIcon: 'fas fa-fw mouse-icon' }
        ]
    });
    /// #endif
    //gene views
    {
        registry.push('tdpView', 'celllinedb_start', function () {
            return import('./views/GeneList');
        }, {
            factory: 'new GeneList',
            name: 'Genes',
            idtype: 'Ensembl',
            selection: 'none'
        });
        registry.push('tdpView', 'expressiontable', function () {
            return import('./views/DependentSampleTable').then((d) => d.DependentSampleTable);
        }, {
            name: 'Expression',
            factory: 'createExpressionDependentSampleTable',
            idtype: 'Ensembl',
            selection: 'some',
            preview() {
                return import('./assets/previews/expression.jpg');
            },
            group: {
                name: 'Sample Overview',
                order: 10
            },
            description: 'Shows a ranking with expression scores',
            topics: ['tcga', 'tissue', 'cellline', 'expression']
        });
        registry.push('tdpView', 'copynumbertable', function () {
            return import('./views/DependentSampleTable').then((d) => d.DependentSampleTable);
        }, {
            name: 'Copy Number',
            factory: 'createCopyNumberDependentSampleTable',
            idtype: 'Ensembl',
            selection: 'some',
            preview() {
                return import('./assets/previews/copy_number.jpg');
            },
            group: {
                name: 'Sample Overview',
                order: 0
            },
            description: 'Shows a ranking with copy number scores',
            topics: ['tcga', 'tissue', 'cellline', 'copy-number']
        });
        registry.push('tdpView', 'mutationtable', function () {
            return import('./views/DependentSampleTable').then((d) => d.DependentSampleTable);
        }, {
            name: 'Mutation',
            factory: 'createMutationDependentSampleTable',
            idtype: 'Ensembl',
            selection: 'some',
            preview() {
                return import('./assets/previews/mutation.jpg');
            },
            group: {
                name: 'Sample Overview',
                order: 20
            },
            description: 'Shows a ranking with mutation scores',
            topics: ['tcga', 'tissue', 'cellline', 'mutation']
        });
        registry.push('tdpView', 'gene_generic_detail_view', function () {
            return import('./views/InfoTable');
        }, {
            name: 'Database Info',
            factory: 'new GeneInfoTable',
            idtype: 'Ensembl',
            selection: 'multiple',
            preview() {
                return import('./assets/previews/database_info.jpg');
            },
            group: {
                name: 'General',
                order: 0
            },
            description: 'Shows all information from the database for the searched genes',
            topics: ['tcga', 'information']
        });
        registry.push('tdpInstantView', 'gene_instant_view', function () {
            return import('./views/GeneInstantView');
        }, {
            factory: 'new GeneInstantView',
            name: 'Database Info',
            idtype: 'Ensembl',
            selection: 'multiple',
            description: 'Shows all information from the database for the searched genes'
        });
        registry.push('tdpView', 'celllinedb_onco_print', function () {
            return import('./views/OncoPrint');
        }, {
            factory: 'new OncoPrint',
            name: 'OncoPrint',
            idtype: 'Ensembl',
            selection: 'some',
            preview() {
                return import('./assets/previews/onco_print.jpg');
            },
            group: {
                name: 'Sample Overview',
                order: 40
            },
            description: 'Shows the OncoPrint detail view',
            topics: ['tcga', 'tissue', 'cellline', 'expression', 'copy-number', 'mutation']
        });
        registry.push('tdpView', 'celllinedb_expression_vs_copynumber', function () {
            return import('./views/ExpressionVsCopyNumber');
        }, {
            factory: 'new ExpressionVsCopyNumber',
            name: 'Expression vs. Copy Number',
            idtype: 'Ensembl',
            selection: 'some',
            preview() {
                return import('./assets/previews/expression_vs_copynumber.jpg');
            },
            group: {
                name: 'Visualization',
                order: 10
            },
            description: 'Renders scatterplots showing the relationship between the expression and copy number values',
            topics: ['tcga', 'tissue', 'cellline', 'expression', 'copy-number']
        });
        registry.push('tdpView', 'celllinedb_co_expression', function () {
            return import('./views/CoExpression');
        }, {
            factory: 'new CoExpression',
            name: 'Co-Expression',
            idtype: 'Ensembl',
            selection: 'some',
            preview() {
                return import('./assets/previews/co_expression.jpg');
            },
            group: {
                name: 'Visualization',
                order: 0
            },
            description: 'Renders scatterplots showing the relationship between expression values of different genes',
            topics: ['tcga', 'tissue', 'cellline', 'expression']
        });
        registry.push('tdpView', 'gene_combined_lineup', function () {
            return import('./views/CombinedDependentSampleTable').then((c) => c.CombinedDependentSampleTable);
        }, {
            factory: 'createCombinedDependentSampleTable',
            name: 'Combined View',
            idtype: 'Ensembl',
            selection: 'some',
            preview() {
                return import('./assets/previews/combined_view.jpg');
            },
            group: {
                name: 'Sample Overview',
                order: 40
            },
            filter: {
                species: 'human'
            },
            description: 'Shows a ranking with expression, copy number and mutation scores',
            topics: ['tcga', 'tissue', 'cellline', 'expression', 'copy-number', 'mutation']
        });
        /// #if include('uploader')
        registry.push('idTypeDetector', 'geneSymbol', function () {
            return import('./detectors/GeneSymbolDetector').then((g) => g.GeneSymbolDetector);
        }, {
            factory: 'human',
            name: 'GeneSymbol',
            idType: 'GeneSymbol_human',
            options: {
                sampleType: 'GeneSymbol'
            }
        });
        // Add additional column descriptions to the LineUpStoredData ranking from tdp_uploaded_data
        registry.push('epTdpUploadedDataLineupColumnDesc', 'geneColumnDesc', function () {
            return import('./providers/LineUpStoredData').then((l) => l.LineUpStoredData);
        }, {
            factory: 'loadEnsemblColumnDesc',
            idType: 'Ensembl'
        });
        // Add additional data rows to the LineUpStoredData ranking from tdp_uploaded_data
        registry.push('epTdpUploadedDataLineupRows', 'geneRows', function () {
            return import('./providers/LineUpStoredData').then((l) => l.LineUpStoredData);
        }, {
            factory: 'loadEnsemblRows',
            idType: 'Ensembl'
        });
        /// #endif
        /// #if include('dTiles')
        registry.push('dTilesSearchProvider', 'gene', function () {
            return import('./providers/SearchProvider').then((s) => s.GeneSearchProvider);
        }, {
            factory: 'createGene',
            idType: 'Ensembl',
            name: 'Genes'
        });
        /// #endif
    }
    registry.push('tdpView', 'celllinedb_cellline', function () {
        return import('./views/CelllineList');
    }, {
        factory: 'new CelllineList',
        name: 'Cell lines',
        idtype: 'Cellline',
        selection: 'none',
        sampleType: 'Cellline'
    });
    registry.push('tdpView', 'bioinfodb_tissue_start', function () {
        return import('./views/TissueList');
    }, {
        factory: 'new TissueList',
        name: 'Tissues',
        idtype: 'Tissue',
        selection: 'none',
        sampleType: 'Tissue'
    });
    // cellline views
    registry.push('tdpView', 'cosmic', function () {
        return import('./views/CosmicProxyView');
    }, {
        factory: 'new CosmicProxyView',
        name: 'COSMIC',
        site: 'https://cancer.sanger.ac.uk/cell_lines/sample/overview?id={cosmicid}&genome=38',
        argument: 'cosmicid',
        idtype: 'Cellline',
        selection: 'chooser',
        preview() {
            return import('./assets/previews/cosmic.jpg');
        },
        group: {
            name: 'External Resources'
            // 'order: 0
        },
        filter: {
            species: 'human'
        },
        description: 'Show information on your search from COSMIC',
        topics: ['cellline', 'external']
    });
    // tissue and cellline views
    ['Tissue', 'Cellline'].forEach(function (idType) {
        const plain = idType.toLowerCase();
        const label = idType === 'Tissue' ? 'Tissues' : 'Cell lines';
        registry.push('tdpView', plain + '_inverted_expressiontable', function () {
            return import('./views/DependentGeneTable').then((d) => d.DependentGeneTable);
        }, {
            name: 'Expression',
            factory: 'createExpressionDependentGeneTable',
            idtype: idType,
            sampleType: idType,
            selection: 'some',
            preview() {
                return import('./assets/previews/expression.jpg');
            },
            group: {
                name: 'Gene Overview',
                order: 20
            },
            description: 'Shows a ranking with the expression scores',
            topics: ['tcga', plain, 'expression']
        });
        registry.push('tdpView', plain + '_inverted_copynumbertable', function () {
            return import('./views/DependentGeneTable').then((d) => d.DependentGeneTable);
        }, {
            name: 'Copy Number',
            factory: 'createCopyNumberDependentGeneTable',
            idtype: idType,
            sampleType: idType,
            selection: 'some',
            preview() {
                return import('./assets/previews/copy_number.jpg');
            },
            group: {
                name: 'Gene Overview',
                order: 0
            },
            description: 'Shows a ranking with copy number scores',
            topics: ['tcga', plain, 'copy-number']
        });
        registry.push('tdpView', plain + '_inverted_mutationtable', function () {
            return import('./views/DependentGeneTable').then((d) => d.DependentGeneTable);
        }, {
            name: 'Mutation',
            factory: 'createMutationDependentGeneTable',
            idtype: idType,
            sampleType: idType,
            selection: 'some',
            preview() {
                return import('./assets/previews/mutation.jpg');
            },
            group: {
                name: 'Gene Overview',
                order: 20
            },
            description: 'Shows a ranking with mutation scores',
            topics: ['tcga', plain, 'mutation']
        });
        registry.push('tdpView', plain + '_combined_lineup', function () {
            return import('./views/CombinedDependentGeneTable').then((c) => c.CombinedDependentGeneTable);
        }, {
            factory: 'createCombinedDependentGeneTable',
            name: 'Combined View',
            idtype: idType,
            selection: 'some',
            preview() {
                return import('./assets/previews/combined_view.jpg');
            },
            group: {
                name: 'Gene Overview',
                order: 40
            },
            filter: {
                species: 'human'
            },
            description: 'Shows a ranking with expression, copy number and mutation scores',
            topics: ['tcga', plain, 'expression', 'copy-number', 'mutation']
        });
        registry.push('tdpView', plain + '_generic_detail_view', function () {
            return import('./views/InfoTable');
        }, {
            name: 'Database Info',
            factory: 'new ' + idType + 'InfoTable',
            idtype: idType,
            selection: 'multiple',
            preview() {
                return import('./assets/previews/database_info.jpg');
            },
            group: {
                name: 'General',
                order: 0
            },
            description: 'Shows all information from the database',
            topics: [plain, 'information']
        });
        /// #if include('dTiles')
        registry.push('dTilesSearchProvider', idType.toLowerCase(), function () {
            return import('./providers/SearchProvider').then((s) => s.GeneSearchProvider);
        }, {
            factory: 'create' + idType,
            idType,
            name: label
        });
        /// #endif
        registry.push('idTypeDetector', plain + 'IDTypeDetector', function () {
            return import('./detectors/IDTypeDetector').then((i) => i.IDTypeDetector);
        }, {
            name: label + ' IDType Detector',
            factory: 'createIDTypeDetector',
            idType,
            options: {
                sampleType: idType
            }
        });
    });
    //scores
    //gene_(Tissue|Celline)
    ['Cellline', 'Tissue'].forEach(function (oppositeIDType) {
        const prefix = 'gene_' + oppositeIDType.toLowerCase();
        const label = oppositeIDType === 'Tissue' ? 'Tissue Sample' : 'Cell Line';
        registry.push('tdpScore', prefix + '_single_score', function () {
            return import('./scores/SingleScoreDialog').then((s) => s.SingleScoreDialog);
        }, {
            name: label + ' Score (Single)',
            factory: 'create',
            idtype: 'Ensembl',
            primaryType: 'Ensembl',
            oppositeType: oppositeIDType
        });
        registry.push('tdpScoreImpl', prefix + '_single_score', function () {
            return import('./scores/SingleScore').then((s) => s.SingleScore);
        }, {
            factory: 'createScore',
            primaryType: 'Ensembl',
            oppositeType: oppositeIDType
        });
        registry.push('tdpScore', prefix + '_aggregated_score', function () {
            return import('./scores/AggregateScoreDialog').then((a) => a.AggregateScoreDialog);
        }, {
            name: label + ' Score (Aggregated)',
            factory: 'create',
            idtype: 'Ensembl',
            primaryType: 'Ensembl',
            oppositeType: oppositeIDType
        });
        registry.push('tdpScoreImpl', prefix + '_aggregated_score', function () {
            return import('./scores/AggregatedScore').then((a) => a.AggregatedScore);
        }, {
            factory: 'createAggregationFrequencyScore',
            primaryType: 'Ensembl',
            oppositeType: oppositeIDType
        });
    });
    //(Tissue|Celline)_gene scores
    ['Cellline', 'Tissue'].forEach(function (idType) {
        const prefix = idType.toLowerCase() + '_gene';
        registry.push('tdpScore', prefix + '_single_score', function () {
            return import('./scores/SingleScoreDialog').then((s) => s.SingleScoreDialog);
        }, {
            name: 'Gene Score (Single)',
            factory: 'create',
            idtype: idType,
            primaryType: idType,
            oppositeType: 'Ensembl'
        });
        registry.push('tdpScoreImpl', prefix + '_single_score', function () {
            return import('./scores/SingleScore').then((s) => s.SingleScore);
        }, {
            factory: 'createScore',
            primaryType: idType,
            oppositeType: 'Ensembl'
        });
        registry.push('tdpScore', prefix + '_aggregated_score', function () {
            return import('./scores/AggregateScoreDialog').then((a) => a.AggregateScoreDialog);
        }, {
            name: 'Gene Score (Aggregated)',
            factory: 'create',
            idtype: idType,
            primaryType: idType,
            oppositeType: 'Ensembl'
        });
        registry.push('tdpScoreImpl', prefix + '_aggregated_score', function () {
            return import('./scores/AggregatedScore').then((a) => a.AggregatedScore);
        }, {
            factory: 'createAggregationFrequencyScore',
            primaryType: idType,
            oppositeType: 'Ensembl'
        });
        registry.push('tdpScore', prefix + '_signature_score', function () {
            return import('./scores/GeneSignatureScore').then((a) => a.GeneSignatureScore);
        }, {
            'factory': 'createGeneSignatureDialog',
            'idtype': idType,
            'name': 'Gene Signature Score'
        });
        registry.push('tdpScoreImpl', prefix + '_signature_score', function () {
            return import('./scores/GeneSignatureScore').then((a) => a.GeneSignatureScore);
        }, {
            'factory': 'createGeneSignatureScore',
            'primaryType': idType
        });
    });
    registry.push('tdpViewGroups', 'chooser_header_order', function () { }, {
        groups: [{
                name: 'General',
                order: 5
            },
            {
                name: 'Sample Overview',
                order: 10
            },
            {
                name: 'Gene Overview',
                order: 20
            },
            {
                name: 'Visualization',
                order: 30
            },
            {
                name: 'Internal Resources',
                order: 40
            },
            {
                name: 'External Resources',
                order: 50
            }
        ]
    });
    registry.push('tdpView', 'gene_details', function () {
        return import('tdp_gene/dist/views/GeneProxyView');
    }, {
        name: 'Genehopper',
        factory: 'new GeneProxyView',
        site: 'http://genehopper.ifis.cs.tu-bs.de/search?q={gene}',
        argument: 'gene',
        idtype: 'Ensembl',
        selection: 'multiple',
        group: {
            name: 'External Resources'
            // 'order: 10
        },
        filter: {
            species: 'human'
        }
    });
    registry.push('tdpView', 'gene_similarity', function () {
        return import('./views/SimilarityView');
    }, {
        name: 'Gene Similarity (internal)',
        factory: 'new SimilarityView',
        idtype: 'Ensembl',
        selection: 'multiple',
        group: {
            name: 'External Resources'
            // 'order: 30
        },
        filter: {
            species: 'human'
        }
    });
    registry.push('tdpView', 'gene_similarity_external', function () {
        return import('tdp_gene/dist/views/GeneProxyView');
    }, {
        name: 'Gene Similarity',
        factory: 'new GeneProxyView',
        site: 'http://genehopper.ifis.cs.tu-bs.de/similargenes?q={gene}&plain=1',
        argument: 'gene',
        idtype: 'Ensembl',
        selection: 'multiple',
        group: {
            name: 'External Resources'
            // 'order: 20
        },
        filter: {
            species: 'human'
        }
    });
    registry.push('tdpView', 'pubmed', function () {
        return import('./views/GeneSymbolProxyView');
    }, {
        name: 'PubMed',
        factory: 'new GeneSymbolProxyView',
        site: 'https://www.ncbi.nlm.nih.gov/pubmed?term={gene}',
        argument: 'gene',
        idtype: 'Ensembl',
        openExternally: true,
        selection: 'chooser',
        preview() {
            return import('./assets/previews/pubmed.jpg');
        },
        group: {
            name: 'External Resources'
            // order: 60
        },
        description: 'Show information on your search from PubMed'
    });
    //(Tissue|Celline)_gene scores
    ['Cellline'].forEach(function (idType) {
        const prefix = idType.toLowerCase() + '_gene';
        registry.push('tdpScore', prefix + '_depletion_single_score', function () {
            return import('./scores/SingleScoreDialog').then((s) => s.SingleScoreDialog);
        }, {
            name: 'Depletion Screen Score (Single)',
            idtype: idType,
            primaryType: idType,
            oppositeType: 'Ensembl',
            factory: 'createSingleDepletionScoreDialog'
        });
        registry.push('tdpScoreImpl', prefix + '_depletion_single_score', function () {
            return import('./scores/SingleScore').then((s) => s.SingleDepletionScore);
        }, {
            factory: 'createSingleDepletionScore',
            primaryType: idType,
            oppositeType: 'Ensembl'
        });
        registry.push('tdpScore', prefix + '_depletion_aggregated_score', function () {
            return import('./scores/AggregateScoreDialog').then((a) => a.AggregateScoreDialog);
        }, {
            name: 'Depletion Screen Score (Aggregated)',
            idtype: idType,
            primaryType: idType,
            oppositeType: 'Ensembl',
            factory: 'createAggregatedDepletionScoreDialog'
        });
        registry.push('tdpScoreImpl', prefix + '_depletion_aggregated_score', function () {
            return import('./scores/AggregatedScore').then((a) => a.AggregatedDepletionScore);
        }, {
            primaryType: idType,
            oppositeType: 'Ensembl',
            factory: 'createAggregatedDepletionScore'
        });
        registry.push('tdpScore', prefix + '_prism_drug_single_score', function () {
            return import('./scores/SingleScoreDialog').then((a) => a.SingleScoreDialog);
        }, {
            name: 'Drug Screen Score',
            idtype: idType,
            primaryType: idType,
            oppositeType: 'Drug',
            factory: 'createSingleDrugScoreDialog'
        });
        registry.push('tdpScoreImpl', prefix + '_prism_drug_single_score', function () {
            return import('./scores/SingleScore').then((a) => a.SingleDrugScore);
        }, {
            factory: 'createSingleDrugScore',
            primaryType: idType,
            oppositeType: 'Drug'
        });
    });
    //gene_(Tissue|Celline)
    ['Cellline'].forEach(function (oppositeIDType) {
        const prefix = 'gene_' + oppositeIDType.toLowerCase();
        registry.push('tdpScore', prefix + '_depletion_single_score', function () {
            return import('./scores/SingleScoreDialog').then((s) => s.SingleScoreDialog);
        }, {
            name: 'Depletion Screen Score (Single)',
            idtype: 'Ensembl',
            primaryType: 'Ensembl',
            oppositeType: oppositeIDType,
            factory: 'createSingleDepletionScoreDialog'
        });
        registry.push('tdpScoreImpl', prefix + '_depletion_single_score', function () {
            return import('./scores/SingleScore').then((s) => s.SingleDepletionScore);
        }, {
            factory: 'createSingleDepletionScore',
            primaryType: 'Ensembl',
            oppositeType: oppositeIDType
        });
        registry.push('tdpScore', prefix + '_depletion_aggregated_score', function () {
            return import('./scores/AggregateScoreDialog').then((a) => a.AggregateScoreDialog);
        }, {
            name: 'Depletion Screen Score (Aggregated)',
            idtype: 'Ensembl',
            primaryType: 'Ensembl',
            oppositeType: oppositeIDType,
            factory: 'createAggregatedDepletionScoreDialog'
        });
        registry.push('tdpScoreImpl', prefix + '_depletion_aggregated_score', function () {
            return import('./scores/AggregatedScore').then((a) => a.AggregatedDepletionScore);
        }, {
            primaryType: 'Ensembl',
            oppositeType: oppositeIDType,
            factory: 'createAggregatedDepletionScore'
        });
    });
    // Common scores for all IDTypes
    ['Cellline', 'Tissue', 'Ensembl'].forEach(function (idType) {
        const prefix = idType.toLowerCase();
        const label = idType === 'Ensembl' ? 'Gene Set' : (idType === 'Tissue' ? idType : 'Cell Line') + ' Panel';
        registry.push('tdpScore', prefix + 'AnnotationColumn', function () {
            return import('./scores/AnnotationColumn').then((a) => a.AnnotationColumn);
        }, {
            'factory': 'createAnnotationColumn',
            'idtype': idType,
            'name': label + ' Annotation'
        });
        registry.push('tdpScoreImpl', prefix + 'AnnotationColumn', function () {
            return import('./scores/AnnotationColumn').then((a) => a.AnnotationColumn);
        }, {
            'factory': 'createAnnotationColumnScore',
            'primaryType': idType
        });
    });
    /// #if include('ordino')
    registry.push('tdpTour', 'ordinoWelcomeTour', function () { return import('./tours').then((t) => t.WelcomeTour); }, {
        factory: 'createTour',
        name: 'Ordino Welcome Tour',
        multiPage: true,
        level: 'beginner',
        canJumpAround: false
    });
    registry.push('tdpTour', 'ordinoStartMenuTour', function () { return import('./tours').then((t) => t.StartMenuTour); }, {
        factory: 'createTour',
        name: 'Overview of Start Menu',
        multiPage: true,
        level: 'beginner',
        canJumpAround: false
    });
    registry.push('tdpTour', 'ordinoAddColumnToGeneListTour', function () { return import('./tours').then((t) => t.AddColumnToGeneListTour); }, {
        factory: 'createTour',
        name: 'Adding Data Columns',
        multiPage: true,
        level: 'beginner',
        canJumpAround: false
    });
    /// #endif
    registry.push(EP_PHOVEA_CORE_LOCALE, 'tdpPublicDBLocaleEN', function () {
        return import('./locales/en/tdp.json').then(PluginRegistry.getInstance().asResource);
    }, {
        ns: 'tdp',
    });
    // generator-phovea:end
}
//# sourceMappingURL=phovea.js.map