import { TourUtils } from 'tdp_core/src/tour/TourUtils';
import { openAddColumPanel } from './utils';
export class PredictionTP53Tour {
    static createTour() {
        return [
            {
                html: `
        <p>
          This case study summarizes another analysis session carried out by a 
          research scientist working in a drug discovery team at a pharmaceutical company.
        </p>

        <p> 
          In order to identify potential drug targets in a set of tumor
          types, the analyst performs experiments with cancer cell lines—cultured cells that are derived from
          tumors and that can proliferate indefinitely in the laboratory.
        </p>

        <p> 
          These cell lines are characterized by various properties, such as tumor type (lung cancer, prostate cancer, etc.) 
          and the set of genes that are mutated. One very important gene in the context of cancer is TP53. It encodes the 
          p53 protein, whose presence is known to suppress the uncontrolled division of cells.
        </p>

        <p>
          Use the "Next" button to iterate through all the steps. You can use the
          <i>"Cancel"</i> button at any time to stop the tour and to interact with Ordino.
          Please note that the tour will load a new analysis session and the current
          one will be discarded.
        </p>`,
            },
            {
                selector: 'ul[data-header="mainMenu"] > li:first-child > a',
                html: `To start the analysis, the team clicks on the <i>'Datasets'</i> tab.`,
                placement: 'centered',
                preAction: () => {
                    const datasetTab = document.querySelector('ul[data-header="mainMenu"] > li:nth-child(1)');
                    if (!datasetTab.classList.contains('active')) {
                        datasetTab.querySelector('a').classList.add('hover');
                    }
                },
                postAction: async () => {
                    const datasetTab = document.querySelector('ul[data-header="mainMenu"] > li:nth-child(1)');
                    if (!datasetTab.classList.contains('active')) {
                        datasetTab.querySelector('a').classList.remove('hover');
                        datasetTab.querySelector('a').click();
                    }
                    await TourUtils.waitFor('.ordino-dataset.tissue-dataset').then(async () => {
                        TourUtils.click('#ordino_dataset_tab > .ordino-scrollspy-nav > a:nth-child(2)');
                        await TourUtils.wait(1000);
                    });
                },
                pageBreak: 'manual',
            },
            {
                selector: '.ordino-dataset.tissue-dataset > .card',
                html: `<p>Here they can choose between the three entity types <i>'Cell Lines'</i>, <i>'Tissue Samples'</i>, and <i>'Genes'</i>.</p>
        <p>They aim to test the applicability of the gene signature using TCGA tumor samples.</p>`,
                placement: 'centered',
            },
            {
                selector: '.ordino-dataset.tissue-dataset [data-testid="tcga-tumors-button"]',
                html: `They start by opening a list of all TCGA tumors.`,
                placement: 'centered',
                postAction: TourUtils.clickSelector,
                pageBreak: 'manual',
            },
            {
                selector: '.le.le-multi.lineup-engine',
                placement: 'centered',
                html: `The information is presented in a tabular format. Additionally to the gene ID, a set of columns containing some basic information is shown by default.`,
                preAction: () => TourUtils.waitFor('.le-tr:nth-of-type(1)', Infinity).then(() => TourUtils.wait(1500)),
            },
            {
                selector: '[data-testid="viewWrapper-0"] [data-id="col4"] .lu-action-filter',
                html: `First, they choose to filter the tumor type by colon adenocarcinoma`,
                placement: 'centered',
                postAction: async () => {
                    TourUtils.click('[data-testid="viewWrapper-0"] [data-id="col4"] .lu-action-filter');
                    await TourUtils.wait(500);
                    TourUtils.click('.lu-dialog-table .lu-checkbox:first-child');
                    await TourUtils.wait(500);
                    TourUtils.click('input[type="checkbox"][data-cat="colon adenocarcinoma"]');
                    await TourUtils.wait(500);
                    TourUtils.click('.lu-dialog-button[type="submit"]');
                },
            },
            {
                selector: '[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span',
                html: `<p>Now they add a single gene score for the following:</p>
        <p>Gene: TP53<p/>
        <p>Data Type: AA Mutated<p/>`,
                placement: 'centered',
                preAction: openAddColumPanel,
                postAction: async () => {
                    TourUtils.click('[data-testid="add-column-button"]');
                    await TourUtils.wait(500);
                    TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span');
                    TourUtils.toggleClass('.lu-adder.once', 'once', false);
                    await TourUtils.waitFor('.modal.show').then(async () => {
                        TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'TP53;', 'input');
                        TourUtils.setValueAndTrigger('.show .col > select', 'mutation-aa_mutated', 'change');
                        await TourUtils.wait(500);
                        TourUtils.click('.modal.show .modal-footer button[type=submit]');
                    });
                },
            },
            {
                selector: '[data-testid="viewWrapper-0"] [data-id="col7"] .lu-action-filter',
                html: `They filter out the samples with an unknown TP53 mutation status.`,
                placement: 'centered',
                preAction: TourUtils.waitForSelector,
                postAction: async () => {
                    TourUtils.click('[data-testid="viewWrapper-0"] [data-id="col7"] .lu-action-filter');
                    await TourUtils.wait(500);
                    TourUtils.click('.lu-dialog > .lu-checkbox input');
                    await TourUtils.wait(500);
                    TourUtils.click('.lu-dialog-button[type="submit"]');
                },
            },
            {
                selector: '[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span',
                html: `<p>Next they add an aggregated gene score with the following criteria:</p>
        <p>Filter: My Named Sets = TP53 Predictor</p>
        <p>Data Type: Expression (TPM)</p>
        <p>Aggregation: Average</p>
        <p>Compute score only for current sample subset</p>`,
                placement: 'centered',
                preAction: async () => {
                    await TourUtils.waitFor('.le-tr:nth-of-type(1) [data-id="col7"] [style="background-color: rgb(170, 170, 170);"]', Infinity);
                    openAddColumPanel();
                },
                postAction: async () => {
                    TourUtils.click('.lu-side-panel-wrapper .lu-adder > button');
                    TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span');
                    TourUtils.toggleClass('.lu-adder.once', 'once', false);
                    await TourUtils.wait(500);
                    TourUtils.setValueAndTrigger('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select', 'ensg', 'change');
                    await TourUtils.wait(1500);
                    TourUtils.click('[data-testid="Filter"] [data-testid="close-button"]');
                    await TourUtils.wait(1500);
                    TourUtils.setValueAndTrigger('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select', 'ensg', 'change');
                    await TourUtils.wait(1500);
                    // Now add the list of 13 genes here instead
                    TourUtils.setValueAndTrigger('.modal-dialog [data-testid="row-2"] .select2 input', 'AEN,BAX,CCNG1,CDKN1A,DDB2,FDXR,MDM2,RPS27L,RRM2B,SESN1,TNFRSF10B,XPC,ZMAT3', 'input');
                    await TourUtils.wait(1020);
                    TourUtils.setValueAndTrigger('.show .modal-body form > .col-sm-12:nth-child(2) select', 'expression-tpm', 'change');
                    TourUtils.setValueAndTrigger('.show [data-testid="aggregation"] select', 'avg', 'change');
                    const checkboxTest = document.querySelector('.modal-dialog [data-testid="form-checkbox"]');
                    if (!checkboxTest.checked) {
                        TourUtils.click('.modal-dialog [data-testid="form-checkbox"]');
                    }
                    await TourUtils.wait(1000);
                    TourUtils.click('.modal.show .modal-footer button[type=submit]');
                },
            },
            {
                selector: '[data-id="col8"] .lu-action-sort',
                html: `They sort by this newly-added gene expression column.`,
                placement: 'centered',
                preAction: TourUtils.waitForSelector,
                postAction: TourUtils.clickSelector,
            },
            {
                selector: ['[data-id="col7"], [data-id="col8"]'],
                html: `<p>Observe: There is a clear correlation between gene expression signature and mutation status of
        TP53: Of the 50 samples with the highest expression only 3 are TP53 mutated, whereas of the 50
        samples with the lowest expression 35 are TP53 mutated.</p>`,
                placement: 'centered',
            },
            {
                html: `<p>Thanks for joining this tour demonstrating the creation and basic testing of the TP53 Predictor Score.</p>
        <p>There are still many more features to discover. Enjoy!</p>`,
            },
        ];
    }
}
//# sourceMappingURL=PredictionTP53Tour.js.map