// import {ToursSection} from 'ordino';
import { IStep, Tour, TourManager, TourUtils } from 'tdp_core';

export class DrugTargetDiscoveryTour {
  static createTour(): IStep[] {
    return [
      {
        html: `<p>Welcome to this short tour showing the assessment of breast cancer cell lines!</p>
        <p>This tour will follow an analysis session from the perspective of a drug discovery team at a pharmaceutical company.</p>
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
        postAction: () => {
          const datasetTab = document.querySelector('ul[data-header="mainMenu"] > li:nth-child(1)') as HTMLElement;
          if (!datasetTab.classList.contains('active')) {
            datasetTab.querySelector('a').classList.remove('hover');
            datasetTab.querySelector('a').click();
          }
          return TourUtils.waitFor('.ordino-dataset.cellline-dataset').then(() =>
            TourUtils.click('#ordino_dataset_tab > .ordino-scrollspy-nav > a:nth-child(1)'),
          );
        },
        pageBreak: 'manual',
      },
      {
        selector: '.ordino-dataset.cellline-dataset > .card [data-testid="ccle-button"]',
        html: `The analyst begins by loading a list of 1009 cell lines from the public CCLE dataset.`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.ordino-dataset.cellline-dataset > .card [data-testid="ccle-button"]').then(() => TourUtils.wait(600)),
        postAction: TourUtils.clickSelector,
        pageBreak: 'manual',
      },
      {
        selector: '.le.le-multi.lineup-engine',
        placement: 'centered',
        html: `The information is presented in a tabular format. Additionally to the gene ID, a set of columns containing some basic information is shown by default.`,
        preAction: () => TourUtils.waitFor('.le.le-multi.lineup-engine', Infinity).then(() => TourUtils.wait(1500)),
      },
      {
        selector: '[data-id="col4"] .lu-action-filter',
        placement: 'centered',
        html: `Since only a subset of tumor types is of interest, the analyst decides to filter the data.`,
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.lu-dialog .lu-dialog-table',
        html: `Here they select only the following filters: astrocytoma/glioblastoma (type of cancer of the brain), bone sarcoma, melanoma, and non-small-cell lung cancer (NSCLC).`,
        placement: 'centered',
        postAction: () => {
          TourUtils.wait(100)
            .then(() => {
              TourUtils.click('.lu-dialog-table .lu-checkbox:first-child');
            })
            .then(() => {
              TourUtils.wait(500).then(() => {
                TourUtils.click('input[type="checkbox"][data-cat="astrocytoma/glioblastoma"]');
                TourUtils.click('input[type="checkbox"][data-cat="bone sarcoma"]');
                TourUtils.click('input[type="checkbox"][data-cat="melanoma"]');
                TourUtils.click('input[type="checkbox"][data-cat="NSCLC"]');
                TourUtils.click('.lu-dialog > .lu-checkbox input');
              });
            });
        },
      },
      {
        selector: ['.lu-dialog .lu-dialog-table, .lu-dialog-button[title="Apply"]'],
        html: `They now apply the filter, after which only 255 cell lines remain.`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('.lu-dialog-button[type="submit"]');
        },
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `As the analyst wants to investigate the TP53 gene, he decides to add a categorical column with the mutation status (mutated vs non mutated).`,
        placement: 'centered',
        preAction: TourUtils.waitForSelector,
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span',
        html: `They do this by adding a column for a single cell line score.`,
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
        html: `Now they select the cell line 'TP53' &hellip;`,
        postAction: () => {
          TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'TP53;', 'input');
        },
      },
      {
        selector: '.modal.show .col > .select2',
        placement: 'centered',
        html: `&hellip; and the data type as 'AA Mutated' &hellip;`,
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
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `<p>Additionally, they decide to add a textual column that provides further details about the mutation (if present).</p>
        <p>This is done by repeating the same steps to add a column, but choosing "AA Mutation" as the data type this time instead.</p>
        <p><i>Individual steps for adding a column have been skipped this time.</i></p>`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('.lu-side-panel-wrapper .lu-adder > button');
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          TourUtils.waitFor('.modal.show').then(() => {
            TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'TP53;', 'input');
            TourUtils.setValueAndTrigger('.show .col > select', 'mutation-aamutation', 'change');
            TourUtils.wait(2000).then(() => TourUtils.click('.modal.show .modal-footer button[type=submit]'));
          });
        },
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `To investigate the effectiveness of the 13 genes in predicting the TP53 status, the analyst loads the average expression of these genes together with a matrix column containing the individual expression values.`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.le [data-col-id="col8"]').then(() => TourUtils.wait(600)),
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `They begin by adding a new column.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span',
        html: `Firstly the column with the average expression is added. This is done by adding a 'Gene Score (Aggregated)' column`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
        },
      },
      {
        selector: [
          '.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select, .show .modal-body form > .col-sm-12:nth-child(1) .row:nth-child(1) .row:nth-child(1) > div:nth-child(2) select',
        ],
        html: `They select 'My Named Sets' in the drop down and then enter 'TP53 Predictor' as the specific set &hellip;`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select'),
        postAction: () => {
          TourUtils.setValueAndTrigger('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select', 'namedset4ensg', 'change');
          TourUtils.wait(1500).then(() => {
            TourUtils.setValueAndTrigger(
              '.show .modal-body form > .col-sm-12:nth-child(1) .row:nth-child(1) .row:nth-child(1) > div:nth-child(2) select',
              '0Qd2E6S4R9',
              'change',
            );
          });
        },
      },
      {
        selector: '.show .modal-body form > .col-sm-12:nth-child(2) select',
        html: `&hellip; then set the 'Data Type' to 'Normalized Gene Expression (TPM Values)' &hellip;`,
        placement: 'centered',
        postAction: () => {
          TourUtils.setValueAndTrigger('.show .modal-body form > .col-sm-12:nth-child(2) select', 'expression-tpm', 'change');
        },
      },
      {
        selector: '.show [data-testid="aggregation"] select',
        html: `&hellip; and set the 'Aggregation' to 'Average' &hellip;`,
        placement: 'centered',
        postAction: () => {
          TourUtils.setValueAndTrigger('.show [data-testid="aggregation"] select', 'avg', 'change');
        },
      },
      {
        selector: '.modal.show .modal-footer button[type=submit]',
        html: `&hellip; and finally click 'Add'.`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('.modal.show .modal-footer button[type=submit]');
        },
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `Similarly, they add a matrix column with all of the individual expression values.`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('.lu-side-panel-wrapper .lu-adder > button');
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          TourUtils.waitFor('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select').then(() => {
            TourUtils.setValueAndTrigger('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select', 'namedset4ensg', 'change');
            TourUtils.setValueAndTrigger(
              '.show .modal-body form > .col-sm-12:nth-child(1) .row:nth-child(1) .row:nth-child(1) > div:nth-child(2) select',
              '0Qd2E6S4R9',
              'change',
            );
            TourUtils.setValueAndTrigger('.show .modal-body form > .col-sm-12:nth-child(2) select', 'expression-tpm', 'change');
            TourUtils.setValueAndTrigger('.show [data-testid="aggregation"] select', 'numbers', 'change');
            TourUtils.wait(1000).then(() => {
              TourUtils.click('.modal.show .modal-footer button[type=submit]');
              TourUtils.click('.modal.show .modal-footer button[type=submit]');
            });
          });
        },
      },
      {
        selector: '[data-id="col7"] .lu-action-filter',
        html: `Furthermore, they decide to hide all cell lines with unknown mutation status.`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('[data-id="col7"] .lu-action-filter');
          TourUtils.waitFor('.lu-dialog > .lu-checkbox input').then(() => {
            TourUtils.click('.lu-dialog > .lu-checkbox input');
            TourUtils.click('.lu-dialog-button[type="submit"]');
          });
        },
      },
      {
        selector: '.le [data-col-id="col9"] .lu-action-sort',
        html: `Next, they sort the list in descending order based on the average gene expression column that was added &hellip;`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[data-testid="en/disable-overview-button"]',
        html: `&hellip; and then swap to the overview.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.le.le-multi.lineup-engine',
        html: `Looking at the overview, the analyst observes the overall good correlation between expression and mutation status: there is a clear enrichment of TP53 mutants among the cell lines with a low score.`,
        placement: 'centered',
      },
      {
        selector: '.le [data-col-id="col4"] .lu-action-group',
        html: `In order to test whether the correlation is present for all selected tumor types, the analyst groups the table by tumor type.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.le.le-multi.lineup-engine',
        html: `They observe that the prediction seems to work particularly well for the astrocytoma/glioblastoma cell lines (almost perfect separation between mutated and non mutated).`,
        placement: 'centered',
      },
      {
        selector: '.le [data-col-id="col7"] .lu-action-more',
        html: `They further investigate this observation by also stratifying by mutation status and aggregating all groups.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.lu-dialog.lu-more-options .lu-action-group',
        html: `To do so, they click 'Group By' &hellip;`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.lu-dialog input[value="true"]',
        html: `&hellip; then select 'Enabled' &hellip;`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.lu-dialog-buttons > [type="submit"]',
        html: `&hellip; and then hit apply.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '[title="Collapse All Groups"]:nth-child(2)',
        html: `Lastly, they aggregate all of the groups.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.le.le-multi.lineup-engine',
        html: `<p>The expression box plots show good separation for astrocytoma/glioblastoma and melanoma, whereas the expression ranges are overlapping for NSCLC.</p>
        <p>Having confirmed that the prediction of the TP53 mutation status works reasonably well in several tumor types, the analyst wants to select a set of cell lines for a wet-lab experiment. He is interested in melanoma cell lines that have no TP53 mutation. Furthermore, the activity of CDKN2A, another important tumor suppressor gene, should be impaired due to a reduced number of CDKN2A gene copies in the genome.</p>`,
        placement: 'centered',
      },
      {
        selector: '.le [data-col-id="col7"] .lu-action-group',
        html: `The analyst now removes the mutation status grouping, &hellip;`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.le [data-col-id="col7"] .lu-action-filter',
        html: `&hellip; includes cell lines for which it is unclear whether TP53 is mutated, &hellip;`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('.le [data-col-id="col7"] .lu-action-filter');
          TourUtils.click('.lu-dialog > .lu-checkbox input');
          TourUtils.wait(1000).then(() => TourUtils.click('.lu-dialog-buttons > [type="submit"]'));
        },
      },
      {
        selector: '',
        html: `&hellip; and unfolds the melanoma cell lines group.`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('[data-testid="en/disable-overview-button"]');
          TourUtils.click('[title="Collapse All Groups"]:nth-child(1)');
          TourUtils.click('.le-tr[data-index="2"] .lu-agg-expand');
        },
      },
      {
        selector: '.le.le-multi.lineup-engine',
        html: `Based on the ranking, he decides to consider all cell lines with unknown TP53 mutation status and a TP53 predictor score greater than 110 as non mutated.`,
        placement: 'centered',
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `He adds a column with the CDKN2A relative copy number, &hellip;`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('.lu-side-panel-wrapper .lu-adder > button');
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          TourUtils.waitFor('.modal.show').then(() => {
            TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'CDKN2A;', 'input');
            TourUtils.setValueAndTrigger('.show .col > select', 'copy_number-relativecopynumber', 'change');
            TourUtils.wait(2000).then(() => TourUtils.click('.modal.show .modal-footer button[type=submit]'));
          });
        },
      },
      {
        selector: '.le [data-col-id="col11"] .lu-action-sort',
        html: `&hellip; sorts by it in ascending order, &hellip;`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.le [data-col-id="col11"] .lu-action-sort').then(() => TourUtils.wait(600)),
        postAction: () => {
          TourUtils.click('.le [data-col-id="col11"] .lu-action-sort');
          TourUtils.click('.le [data-col-id="col11"] .lu-action-sort');
        },
      },
      {
        selector: '.le [data-col-id="col11"] .lu-action-filter',
        html: `&hellip; and filters out missing data.`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('.le [data-col-id="col11"] .lu-action-filter');
          TourUtils.click('.lu-dialog > .lu-summary .lu-checkbox input');
          TourUtils.wait(1000).then(() => TourUtils.click('.lu-dialog-buttons > [type="submit"]'));
        },
      },
      {
        selector: ['.le-tr[data-index="2"] .lu-renderer-selection, .le-tr[data-index="20"] .lu-renderer-selection'],
        html: `Finally, he selects the top hits of the resulting list (see Figure 11). All these cell lines fulfill the analyst's requirements.`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('.le-tr[data-index="2"] .lu-renderer-selection');
          TourUtils.click('.le-tr[data-index="3"] .lu-renderer-selection');
          TourUtils.click('.le-tr[data-index="4"] .lu-renderer-selection');
          TourUtils.click('.le-tr[data-index="5"] .lu-renderer-selection');
          TourUtils.click('.le-tr[data-index="6"] .lu-renderer-selection');
          TourUtils.click('.le-tr[data-index="7"] .lu-renderer-selection');
          TourUtils.click('.le-tr[data-index="8"] .lu-renderer-selection');
          TourUtils.click('.le-tr[data-index="9"] .lu-renderer-selection');
          TourUtils.click('.le-tr[data-index="10"] .lu-renderer-selection');
          TourUtils.click('.le-tr[data-index="11"] .lu-renderer-selection');
          TourUtils.click('.le-tr[data-index="12"] .lu-renderer-selection');
          TourUtils.click('.le-tr[data-index="13"] .lu-renderer-selection');
          TourUtils.click('.le-tr[data-index="14"] .lu-renderer-selection');
          TourUtils.click('.le-tr[data-index="15"] .lu-renderer-selection');
        },
      },
    ];
  }
}
