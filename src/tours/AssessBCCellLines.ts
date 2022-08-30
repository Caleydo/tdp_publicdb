import {ToursSection} from 'ordino';
import { IStep, Tour, TourUtils } from 'tdp_core';

export class AssessBCCellLines {
  static createTour(): IStep[] {
    return [
      {
        html: `<p>Welcome to this short tour showing the assessment of breast cancer cell lines!</p>
        <p>
          Use the "Next" button to iterate through all the steps. You can use the
          <i>"Cancel"</i> button at any time to stop the tour and to interact with Ordino.
          Please note that the tour will load a new analysis session and the current
          one will be discarded.
        </p>`,
      },
      {
        selector: 'ul[data-header="mainMenu"] > li:first-child > a',
        html: `To start an analysis, click on the <i>'Datasets'</i> tab. Subsequently, you can define the list of entities you want to work with`,
        placement: 'centered',
        preAction: () => {
          const datasetTab = document.querySelector('ul[data-header="mainMenu"] > li:nth-child(1)') as HTMLElement;
          if (!datasetTab.classList.contains('active')) {
            datasetTab.querySelector('a').classList.add('hover');
          }
        },
        postAction: () => {
          const datasetTab = document.querySelector('ul[data-header="mainMenu"] > li:nth-child(1)') as HTMLElement;
          if (!datasetTab.classList.contains('active')) {
            datasetTab.querySelector('a').classList.remove('hover');
            datasetTab.querySelector('a').click();
          }
          return TourUtils.waitFor('.ordino-dataset.genes-dataset').then(() => TourUtils.click('#ordino_dataset_tab > .ordino-scrollspy-nav > a:nth-child(3)'));
        },
        pageBreak: 'manual',
      },
      {
        selector: '.ordino-dataset.genes-dataset > .card',
        html: `<p>You can choose between the three entity types <i>'Cell Lines'</i>, <i>'Tissue Samples'</i>, and <i>'Genes'</i>.</p> <p>In this example we will work with a list of genes</p>`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('#ordino_dataset_tab > .ordino-scrollspy-container .genes-dataset > .card').then(() => TourUtils.wait(600)),
        postAction: () => TourUtils.click('.ordino-dataset.genes-dataset .session-tab > li:first-child'),
      },
      {
        selector: '[data-testid="normal-chromosome-protein-coding-human-genes-button"]',
        html: `The scientist starts by loading the list of all protein coding genes.`,
        placement: 'centered',
        postAction: () => {
          return TourUtils.waitFor('.ordino-dataset.genes-dataset .dataset-entry button[title^="Name: normal chromosome protein coding human genes"]').then(
            TourUtils.click,
          );
        },
        pageBreak: 'manual',
      },
      {
        selector: '.le.le-multi.lineup-engine',
        placement: 'centered',
        html: `The information is presented in a tabular format. Additionally to the gene ID, a set of columns containing some basic information is shown by default.`,
        preAction: () => TourUtils.waitFor('.le.le-multi.lineup-engine', Infinity).then(() => TourUtils.wait(600)),
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `Additional columns can be added using the plus sign.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span',
        html: `First, we want to add a new column`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
        },
      },
      {
        selector: '.modal.show .col > .select3',
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.modal.show').then(() => TourUtils.wait(150)),
        html: `We select the Cell Line`,
        postAction: () => {
          TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'HCC1954;', 'input');
        },
      },
      {
        selector: '.modal.show .col > .select2',
        placement: 'centered',
        html: `and the data type`,
        postAction: () => {
          TourUtils.setValueAndTrigger('.show .col > select', 'copy_number-relativecopynumber', 'change');
        },
      },
      {
        selector: '.modal.show .modal-footer button[type=submit]',
        html: `&hellip; and click <i>'Add'</i>`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.le header [data-col-id="col8"]',
        placement: 'centered',
        html: `The new column was added here`,
        preAction: TourUtils.waitForSelector,
      },
      {
        selector: '.le [data-col-id="col8"] .lu-action-sort',
        placement: 'centered',
        html: `Now, we want to sort by this column`,
        postAction: () => {
          TourUtils.click('.le [data-col-id="col8"] .lu-action-sort');
        },
      },
      {
        selector: '.le.le-multi.lineup-engine',
        placement: 'centered',
        html: `Now everything was sorted!`,
      },
      {
        selector: '.le.le-multi.lineup-engine',
        placement: 'centered',
        html: `After sorting by this column, the analyst observes
        that about 15 genes on chromosome 17 are affected by a large genomic amplification.`,
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `In order to identify the most relevant gene of these, the analyst adds a column with the gene expression (a measure of activity) in HCC1954`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span',
        html: `We want to add a 2nd new column`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
        },
      },
      {
        selector: '.modal.show .col > .select3',
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.modal.show').then(() => TourUtils.wait(150)),
        html: `We select the 2nd Cell Line`,
        postAction: () => {
          TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'HCC1954;', 'input');
        },
      },
      {
        selector: '.modal.show .col > .select2',
        placement: 'centered',
        html: `and the 2nd data type`,
        postAction: () => {
          TourUtils.setValueAndTrigger('.show .col > select', 'expression-tpm', 'change');
        },
      },
      {
        selector: '.modal.show .modal-footer button[type=submit]',
        html: `&hellip; and click <i>'Add'</i>`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `They also add a gene sensitivity score (a measure of importance for cell survival) for HCC1954 (RSA scores obtained from DRIVE data set [4]).`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(5) > span',
        html: `We want to add a 3rd new column`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(5) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
        },
      },
      {
        selector: '.modal.show .col > .select3',
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.modal.show').then(() => TourUtils.wait(150)),
        html: `We select the 3rd Cell Line`,
        postAction: () => {
          TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'HCC1954;', 'input');
        },
      },
      {
        selector: '.modal.show .col > .select2',
        placement: 'centered',
        html: `and the 3rd data type`,
        postAction: () => {
          TourUtils.setValueAndTrigger('.show .col > select', 'depletion-rsa', 'change');
        },
      },
      {
        selector: '.modal.show .modal-footer button[type=submit]',
        html: `&hellip; and click <i>'Add'</i>`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-id="col10"] > .lu-toolbar > .lu-action-more',
        html: `We now want to invert the linear scaling of the depletion screen score to improve the scale's readability.`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('[data-id="col10"] > .lu-toolbar > .lu-action-more');
          TourUtils.click('.lu-action-data-mapping > span');
          TourUtils.setValueAndTrigger('.browser-default', 'linear_invert', 'change');
          TourUtils.click('.lu-dialog-buttons > [type="submit"]');
        },
      },
      {
        selector: '[data-index="0"]',
        placement: 'centered',
        html: `Observe: Of the highly amplified genes, ERBB2 (HER2) has the highest expression and the lowest sensitivity score. Therefore, it is probably the most relevant gene of this amplicon.`,
      },
      {
        selector: ['.le header [data-col-id="col9"], .le header [data-col-id="col10"]'],
        html: `<p>Combine both score columns to obtain stacked bars.</p>
        <p>Observe: Combining the columns highlights the importance of ERBB2.</p>
        <p>It is therefore probably the most relevant gene within this amplified genomic region.</p>`,
        placement: 'centered',
      },
      {
        selector: '[data-index="0"]',
        html: `<p>This finding leads the scientist to the question whether ERBB2 is also highly expressed and frequently amplified in other breast cancer cell lines.</p>
        <p>To investigate this, the analyst adds the following columns:
          <ul>
            <li>A column with the average gene expression</li>
            <li>A column with the gene copy number distribution</li>
            <li>A column with the gene amplification frequency across all breast cancer cell lines</li>
          </ul>
        </p>`,
        placement: 'centered',
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `1. A column with the average gene expression`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('.lu-side-panel-wrapper .lu-adder > button');
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          return TourUtils.waitFor('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select').then(() => {
            TourUtils.setValueAndTrigger('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select', 'tumortype', 'change');
            TourUtils.setValueAndTrigger(
              '.show .modal-body form > .col-sm-12:nth-child(1) .row:nth-child(1) .row:nth-child(1) > div:nth-child(2) select',
              'breast carcinoma',
              'change',
            );
            TourUtils.setValueAndTrigger('.show .modal-body form > .col-sm-12:nth-child(2) select', 'expression-tpm', 'change');
            TourUtils.setValueAndTrigger('.show [data-testid="aggregation"] select', 'avg', 'change');
            TourUtils.wait(1000).then(() => TourUtils.click('.modal.show .modal-footer button[type=submit]'));
          });
        },
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `2. A column with the gene copy number distribution`,
        placement: 'centered',
        preAction: () => {
          TourUtils.waitFor('.le header [data-col-id="col11"]');
        },
        postAction: () => {
          TourUtils.click('.lu-side-panel-wrapper .lu-adder > button');
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          return TourUtils.waitFor('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select').then(() => {
            TourUtils.setValueAndTrigger('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select', 'tumortype', 'change');
            TourUtils.setValueAndTrigger(
              '.show .modal-body form > .col-sm-12:nth-child(1) .row:nth-child(1) .row:nth-child(1) > div:nth-child(2) select',
              'breast carcinoma',
              'change',
            );
            TourUtils.setValueAndTrigger('.show .modal-body form > .col-sm-12:nth-child(2) select', 'copy_number-relativecopynumber', 'change');
            TourUtils.setValueAndTrigger('.show [data-testid="aggregation"] select', 'boxplot', 'change');
            TourUtils.wait(1000).then(() => TourUtils.click('.modal.show .modal-footer button[type=submit]'));
          });
        },
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `3. A column with the gene amplification frequency across all breast cancer cell lines`,
        placement: 'centered',
        preAction: () => {
          TourUtils.waitFor('.le header [data-col-id="col12"]');
        },
        postAction: () => {
          TourUtils.click('.lu-side-panel-wrapper .lu-adder > button');
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          return TourUtils.waitFor('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select').then(() => {
            TourUtils.setValueAndTrigger('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select', 'tumortype', 'change');
            TourUtils.setValueAndTrigger(
              '.show .modal-body form > .col-sm-12:nth-child(1) .row:nth-child(1) .row:nth-child(1) > div:nth-child(2) select',
              'breast carcinoma',
              'change',
            );
            TourUtils.setValueAndTrigger('.show .modal-body form > .col-sm-12:nth-child(2) select', 'copy_number-relativecopynumber', 'change');
            TourUtils.setValueAndTrigger('.show [data-testid="aggregation"] select', 'frequency', 'change');
            TourUtils.waitFor('.show [data-testid="Comparison Operator"]').then(() => {
              TourUtils.setValueAndTrigger('.show [data-testid="comparison-operator"] select', '>', 'change');
              TourUtils.setValueAndTrigger('.show [type="number"]', '4', 'input');
            });
            TourUtils.wait(1000).then(() => TourUtils.click('.modal.show .modal-footer button[type=submit]'));
          });
        },
      },
      {
        selector: '.le.le-multi.lineup-engine',
        html: `Observe: ERBB2 is amplified in almost 25% of all assessed breast cancer cell lines. Further, it is highly expressed.`,
        placement: 'centered',
        preAction: () => {
          TourUtils.waitFor('.le header [data-col-id="col13"]');
        },
      },
      {
        selector: '[data-index="0"] .lu-renderer-selection',
        html: `<p>The aim is now to get more information about ERBB2.</p>
        <p>Select ERBB2 in the list.</p>`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-viewid="celllinedb_expression_vs_copynumber"]',
        html: `Open the Expression vs Copy Number detail view`,
        placement: 'centered',
        preAction: TourUtils.waitForSelector,
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.ids',
        html: `Observe the direct correlation between copy number and expression of ERBB2`,
        placement: 'centered',
        preAction: () => {
          return TourUtils.waitFor('.ids');
        },
      },
      {
        selector: '[data-viewid="targetvalidation"]',
        html: `Now open the Open Targets detail view...`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-viewid="pubmed"]',
        html: `...and the PubMed detail view.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '',
        html: `Question: In what cell lines is ERBB2 amplified? Select cell lines with ERBB2 amplification that have mutation in BRCA1 or BRCA2`,
        placement: 'centered',
      },
      {
        selector: '[data-viewid="copynumbertable"]',
        html: `Start by opening the Copy Number detail view`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-id="col7"] .lu-action-sort',
        html: `Now sort by the copy number`,
        placement: 'centered',
        preAction: TourUtils.waitForSelector,
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-testid="viewWrapper-1"] [data-id="col4"] .lu-action-filter',
        html: `Filter for breast cancer via column menu of column tumor type (also filter out cell lines with unknown tumor type)`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.lu-dialog .lu-dialog-table',
        html: `First select only the "breast carcinoma" tumor type.`,
        placement: 'centered',
        postAction: () => {
          TourUtils.wait(100)
            .then(() => {
              TourUtils.click('.lu-dialog-table .lu-checkbox:first-child');
            })
            .then(() => {
              TourUtils.wait(500).then(() => {
                TourUtils.click('input[type="checkbox"][data-cat="breast carcinoma"]');
              });
            });
        },
      },
      {
        selector: '.lu-dialog .lu-dialog-table',
        html: `Then filter cell lines with unknown types and submit the filter.`,
        placement: 'centered',
        postAction: () => {
          TourUtils.wait(100)
            .then(() => {
              TourUtils.click('.lu-dialog > .lu-checkbox input');
            })
            .then(() => {
              TourUtils.wait(500).then(() => {
                TourUtils.click('.lu-dialog-button[type="submit"]');
              });
            });
        },
      },
      {
        selector: '[data-testid="viewWrapper-1"] .lu-side-panel-wrapper .lu-adder > button',
        html: `Let's now add the BRCA gene scores.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-testid="viewWrapper-1"] [data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span',
        html: `We want to add a new column`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click(
            '[data-testid="viewWrapper-1"] [data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span',
          );
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
        },
      },
      {
        selector: '.modal.show .col > .select3',
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.modal.show').then(() => TourUtils.wait(150)),
        html: `We select the BRCA1 and BRCA2 cell lines.`,
        postAction: () => {
          TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'BRCA1;', 'input');
          TourUtils.wait(400).then(() => {
            TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'BRCA2;', 'input');
          });
        },
      },
      {
        selector: '.modal.show .col > .select2',
        placement: 'centered',
        html: `Then set the data type to AA Mutated.`,
        postAction: () => {
          TourUtils.setValueAndTrigger('.show .col > select', 'mutation-aa_mutated', 'change');
        },
      },
      {
        selector: '.modal.show .modal-footer button[type=submit]',
        html: `&hellip; and click <i>'Add'</i>`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: ['[data-testid="viewWrapper-1"] [data-index="0"].le-tr, [data-testid="viewWrapper-1"] [data-index="2"].le-tr'],
        html: `<p>Observe:</p>
        <p>HCC1954 has the highest ERBB2 amplification among BRCA1 mutated cell lines.</p>
        <p>HCC1569 has the highest ERBB2 amplification among BRCA2 mutated cell lines.</p>`,
        placement: 'centered',
      },
      {
        selector: '',
        html: `Aim: Show information provided by COSMIC about these two cell lines`,
        placement: 'centered',
      },
      {
        selector: ['[data-testid="viewWrapper-1"] [data-index="0"].le-tr, [data-testid="viewWrapper-1"] [data-index="2"].le-tr'],
        html: `Select HCC1954 and HCC1569`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('[data-testid="viewWrapper-1"] [data-index="0"] .lu-renderer-selection');
          TourUtils.click('[data-testid="viewWrapper-1"] [data-index="2"] .lu-renderer-selection');
        },
      },
      {
        selector: '[data-testid="viewWrapper-1"] [data-viewid="cosmic"]',
        html: `Open the COSMIC detail view`,
        placement: 'centered',
        preAction: TourUtils.waitForSelector,
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-testid="viewWrapper-2"] select',
        html: `Use the drop-down menu to switch between the two cell lines.`,
        placement: 'centered',
        preAction: TourUtils.waitForSelector,
        postAction: TourUtils.clickSelector,
      },
      {
        html: `<p>Thanks for joining this tour demonstrating the assessment of breast cancer cell lines.</p>
        <p>There are still many more features to discover. Enjoy!</p>`,
      },
    ];
  }
}
