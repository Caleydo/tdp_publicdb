import { IStep, TourUtils } from 'tdp_core';
import { openAddColumPanel, setNextActive } from './utils';

export class AssessBCCellLinesTour {
  static createTour(): IStep[] {
    return [
      {
        html: `<p>Welcome to this short tour showing the assessment of breast cancer cell lines!</p>
        <p>This tour will show an example analysis session from scientists in cancer research.</p>
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
          const datasetTab = document.querySelector('ul[data-header="mainMenu"] > li:nth-child(1)') as HTMLElement;
          if (!datasetTab.classList.contains('active')) {
            datasetTab.querySelector('a').classList.add('hover');
          }
        },
        postAction: async () => {
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
        html: `<p>Here they choose between the three entity types <i>'Cell Lines'</i>, <i>'Tissue Samples'</i>, and <i>'Genes'</i>.</p>
        <p>In this example they choose to work with a list of genes.</p>`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('#ordino_dataset_tab > .ordino-scrollspy-container .genes-dataset > .card').then(() => TourUtils.wait(1000)),
        postAction: () => TourUtils.click('.ordino-dataset.genes-dataset .session-tab > li:first-child'),
      },
      {
        selector: '[data-testid="normal-chromosome-protein-coding-human-genes-button"]',
        html: `The scientists start by loading the list of all protein coding genes for humans.`,
        placement: 'centered',
        postAction: async () => {
          return TourUtils.waitFor('.ordino-dataset.genes-dataset .dataset-entry button[title^="Name: normal chromosome protein coding human genes"]').then(
            TourUtils.click,
          );
        },
        pageBreak: 'manual',
      },
      {
        selector: '.le.le-multi.lineup-engine',
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.le.le-multi.lineup-engine', Infinity).then(() => TourUtils.wait(2000)),
        html: `The information is presented in a tabular format. Additionally to the gene ID, a set of columns containing some basic information is shown by default.`,
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `They begin by adding an additional column, done so by clicking on the plus icon shown here.`,
        placement: 'centered',
        postAction: openAddColumPanel,
      },
      {
        selector: '[data-testid="lu-adder-div"] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span',
        html: `They choose to add a column for a single cell line score.`,
        placement: 'centered',
        postAction: async () => {
          TourUtils.click('[data-testid="lu-adder-div"] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          return Promise.resolve();
        },
      },
      {
        selector: '.modal.show .col > .select3',
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.modal.show', Infinity).then(() => TourUtils.wait(150)),
        html: `Now they select the cell line 'HCC1954' &hellip;`,
        postAction: () => {
          TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'HCC1954;', 'input');
        },
      },
      {
        selector: '.modal.show .col > .select2',
        placement: 'centered',
        html: `&hellip; and the data type as 'Relative Copy Number' &hellip;`,
        postAction: () => {
          TourUtils.setValueAndTrigger('.show .col > select', 'copy_number-relativecopynumber', 'change');
        },
      },
      {
        selector: '.modal.show .modal-footer button[type=submit]',
        html: `&hellip; and click <i>'Add'</i>.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.le [data-col-id="col8"] .lu-action-sort',
        placement: 'centered',
        html: `They want to sort by this newly added column, so they click on the sort button in the column header.`,
        preAction: () => TourUtils.waitFor('.le-tr[data-index="0"] [data-id="col8"].lu-renderer-number', Infinity),
        postAction: () => {
          TourUtils.click('.le [data-col-id="col8"] .lu-action-sort');
        },
      },
      {
        selector: ['[data-index="0"].le-tr, [data-index="15"].le-tr'],
        placement: 'centered',
        html: `After sorting by this column, the analyst observes that about 15 genes on chromosome 17 are affected by a large genomic amplification.`,
        preAction: () => TourUtils.waitFor('[data-index="0"].le-tr', Infinity).then(() => TourUtils.wait(2000)),
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `<p>In order to identify the most relevant of these genes, the analyst adds a column with the Normalized Gene Expression (a measure of activity) for cell line HCC1954</p>
        <p><i>Individual steps for adding a column have been skipped this time.</i></p>`,
        placement: 'centered',
        postAction: async () => {
          TourUtils.click('.lu-side-panel-wrapper .lu-adder > button');
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          await TourUtils.waitFor('.modal.show').then(async () => {
            TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'HCC1954;', 'input');
            TourUtils.setValueAndTrigger('.show .col > select', 'expression-tpm', 'change');
            await TourUtils.wait(1000);
            TourUtils.click('.modal.show .modal-footer button[type=submit]');
          });
        },
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `They also add a column with a Gene Sensitivity Score (a measure of importance for cell survival) for HCC1954.`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.le-tr[data-index="0"] [data-id="col9"].lu-renderer-number', Infinity),
        postAction: () => {
          TourUtils.click('.lu-side-panel-wrapper .lu-adder > button');
        },
      },
      {
        selector: '[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(5) > span',
        html: `<p>To do so, they select to add a 'Depletion Screen Score (Single)' column.</p>
        <p><i>Similarly, the specific steps for adding a column have been skipped this time.</i></p>`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(5) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          TourUtils.waitFor('.modal.show').then(() => {
            TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'HCC1954;', 'input');
            TourUtils.setValueAndTrigger('.show .col > select', 'depletion-rsa', 'change');
            TourUtils.wait(1000).then(() => TourUtils.click('.modal.show .modal-footer button[type=submit]'));
          });
        },
      },
      {
        selector: '[data-id="col10"] > .lu-toolbar > .lu-action-more',
        html: `<p>In an effort to improve the depletion score's readability, they decide to invert the linear scaling.</p>
        <p>To do this, they click on the three dots for more column options.</p>`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.le-tr[data-index="0"] [data-id="col10"].lu-renderer-number', Infinity),
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.lu-action-data-mapping > span',
        html: `They now click on 'Data Mapping'.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: ['.browser-default, .lu-dialog-buttons > [type="submit"]'],
        html: `They select the 'Invert' option in the Normalization Scaling dropdown and then click on the tick at the bottom right to apply the new mapping.`,
        placement: 'centered',
        preAction: () => TourUtils.setValueAndTrigger('.browser-default', 'linear_invert', 'change'),
        postAction: () => {
          TourUtils.click('.lu-dialog-buttons > [type="submit"]');
        },
      },
      {
        selector: '[data-index="0"]',
        placement: 'centered',
        html: `Observe: Of the highly amplified genes, they notice that ERBB2 (HER2) has the highest expression and the lowest sensitivity score. Therefore, it is probably the most relevant gene of this amplicon.`,
      },
      {
        selector: ['.le header [data-col-id="col9"], .le header [data-col-id="col10"]'],
        html: `<p>They can combine both score columns by dragging them together to obtain stacked bars.</p>
        <p>Observe: Combining the columns highlights the importance of ERBB2.</p>
        <p>It is therefore probably the most relevant gene within this amplified genomic region.</p>`,
        placement: 'centered',
        allowUserInteraction: true,
      },
      {
        selector: '[data-index="0"]',
        html: `<p>This finding leads the scientist to the question whether ERBB2 is also highly expressed and frequently amplified in other breast cancer cell lines.</p>
        <p>To investigate this, the analyst adds the following columns:
          <ul>
            <li>A column with the average gene expression for breast cancer cell lines</li>
            <li>A column with the gene copy number distribution for breast cancer cell lines in boxplot format</li>
            <li>A column with the gene amplification frequency (>4) across all breast cancer cell lines</li>
          </ul>
        </p>`,
        placement: 'centered',
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `1. A column with the average gene expression for breast cancer cell lines`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('.lu-side-panel-wrapper .lu-adder > button');
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          TourUtils.waitFor('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select').then(async () => {
            TourUtils.setValueAndTrigger('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select', 'tumortype', 'change');
            await TourUtils.wait(500);
            TourUtils.setValueAndTrigger(
              '.show .modal-body form > .col-sm-12:nth-child(1) .row:nth-child(1) .row:nth-child(1) > div:nth-child(2) select',
              'breast carcinoma',
              'change',
            );
            TourUtils.setValueAndTrigger('.show .modal-body form > .col-sm-12:nth-child(2) select', 'expression-tpm', 'change');
            TourUtils.setValueAndTrigger('.show [data-testid="aggregation"] select', 'avg', 'change');
            TourUtils.wait(1000).then(() => {
              TourUtils.click('.modal.show .modal-footer button[type=submit]');
            });
          });
        },
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `2. A column with the gene copy number distribution for breast cancer cell lines in boxplot format`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.le-tr:nth-of-type(1) [data-id="col11"].lu-renderer-number', Infinity),
        postAction: () => {
          TourUtils.click('.lu-side-panel-wrapper .lu-adder > button');
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          TourUtils.waitFor('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select').then(async () => {
            TourUtils.setValueAndTrigger('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select', 'tumortype', 'change');
            await TourUtils.wait(500);
            TourUtils.setValueAndTrigger(
              '.show .modal-body form > .col-sm-12:nth-child(1) .row:nth-child(1) .row:nth-child(1) > div:nth-child(2) select',
              'breast carcinoma',
              'change',
            );
            TourUtils.setValueAndTrigger('.show .modal-body form > .col-sm-12:nth-child(2) select', 'copy_number-relativecopynumber', 'change');
            TourUtils.setValueAndTrigger('.show [data-testid="aggregation"] select', 'boxplot', 'change');
            TourUtils.wait(1000).then(() => {
              TourUtils.click('.modal.show .modal-footer button[type=submit]');
            });
          });
        },
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `3. A column with the gene amplification frequency (>4) across all breast cancer cell lines`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.le-tr:nth-of-type(1) [data-id="col12"].lu-renderer-boxplot', Infinity),
        postAction: () => {
          TourUtils.click('.lu-side-panel-wrapper .lu-adder > button');
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          TourUtils.waitFor('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select').then(async () => {
            TourUtils.setValueAndTrigger('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select', 'tumortype', 'change');
            await TourUtils.wait(500);
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
            TourUtils.wait(1000).then(() => {
              TourUtils.click('.modal.show .modal-footer button[type=submit]');
            });
          });
        },
      },
      {
        selector: '.le.le-multi.lineup-engine',
        html: `Observe: They notice that ERBB2 is amplified in almost 25% of all assessed breast cancer cell lines. Further, it is highly expressed.`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.le-tr:nth-of-type(1) [title="0.25"]', Infinity),
      },
      {
        selector: '[data-index="0"] .lu-renderer-selection',
        html: `<p>The aim is now to get more information about ERBB2.</p>
        <p>They select ERBB2 in the list.</p>`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-viewid="celllinedb_expression_vs_copynumber"]',
        html: `They open the Expression vs Copy Number detail view.`,
        placement: 'centered',
        preAction: TourUtils.waitForSelector,
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.tdp-view.expressionVsCopyNumber .ids',
        html: `Here they observe the direct correlation between copy number and expression of ERBB2.`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.tdp-view.expressionVsCopyNumber .ids').then(() => TourUtils.wait(300)),
      },
      {
        selector: '',
        html: `Their question is now: In what cell lines is ERBB2 amplified?`,
        placement: 'centered',
      },
      {
        selector: '[data-viewid="copynumbertable"]',
        html: `They continue by opening the Copy Number detail view &hellip;`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-id="col7"] .lu-action-sort',
        html: `&hellip; and then sorting by the copy number.`,
        placement: 'centered',
        preAction: TourUtils.waitForSelector,
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-testid="viewWrapper-1"] [data-id="col4"] .lu-action-filter',
        html: `They want to filter for breast cancer via the column menu of column 'Tumor Type', while also filtering out cell lines with unknown tumor types.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.lu-dialog .lu-dialog-table',
        html: `First they select only the "breast carcinoma" tumor type.`,
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
        selector: ['.lu-dialog .lu-dialog-table, .lu-dialog-button[title="Apply"]'],
        html: `Then they filter out cell lines with unknown types (the missing value rows) and submit the filter.`,
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
        html: `They now want to add the BRCA gene score columns.`,
        placement: 'centered',
        postAction: openAddColumPanel,
      },
      {
        selector: '[data-testid="viewWrapper-1"] [data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span',
        html: `Once again, they use the plus icon to add a new column.`,
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
        html: `Here they select the BRCA1 and BRCA2 cell lines &hellip;`,
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
        html: `&hellip; and then they set the data type to AA Mutated &hellip;`,
        postAction: () => {
          TourUtils.setValueAndTrigger('.show .col > select', 'mutation-aa_mutated', 'change');
        },
      },
      {
        selector: '.modal.show .modal-footer button[type=submit]',
        html: `&hellip; and click <i>'Add'</i>.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: ['[data-testid="viewWrapper-1"] [data-index="0"].le-tr, [data-testid="viewWrapper-1"] [data-index="1"].le-tr'],
        html: `<p>Observe:</p>
        <p>HCC1954 has the highest ERBB2 amplification among BRCA1 mutated cell lines.</p>
        <p>HCC1569 has the highest ERBB2 amplification among BRCA2 mutated cell lines.</p>`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.le-tr:nth-of-type(1) [data-id="col8"][data-renderer="categorical"]'),
      },
      {
        selector: '',
        html: `Finally, their aim is to find information provided by COSMIC about these two cell lines.`,
        placement: 'centered',
      },
      {
        selector: ['[data-testid="viewWrapper-1"] [data-index="0"].le-tr, [data-testid="viewWrapper-1"] [data-index="1"].le-tr'],
        html: `They select HCC1954 and HCC1569 &hellip;`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('[data-testid="viewWrapper-1"] [data-index="0"] .lu-renderer-selection');
          TourUtils.click('[data-testid="viewWrapper-1"] [data-index="1"] .lu-renderer-selection');
        },
      },
      {
        selector: '[data-testid="viewWrapper-1"] [data-viewid="cosmic"]',
        html: `&hellip; and open the COSMIC detail view.`,
        placement: 'centered',
        preAction: TourUtils.waitForSelector,
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-testid="viewWrapper-2"] select',
        html: `Here they can use the drop-down menu to switch between the two cell lines.`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('[data-testid="viewWrapper-2"] select').then(() => TourUtils.wait(1000)),
      },
      {
        html: `<p>Thanks for joining this tour demonstrating the assessment of breast cancer cell lines.</p>
        <p>There are still many more features to discover. Enjoy!</p>`,
      },
    ];
  }
}
