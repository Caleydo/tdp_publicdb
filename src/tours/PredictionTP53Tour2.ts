// import {ToursSection} from 'ordino';
import { IStep } from 'tdp_core';
import { TourUtils } from 'tdp_core/src/tour/TourUtils';
import { openAddColumPanel } from './utils';

export class PredictionTP53Tour2 {
  static createTour(): IStep[] {
    return [
      {
        html: `
        <p>
          The following is a continuation of the tour investigating the TP53 Predictor Score, this 
          time in conjunction with the MDM2 sensitivity score, compared against all cell lines.
        </p>
        <p>
          Use the "Next" button to iterate through all the steps. You can use the
          <i>"Cancel"</i> button at any time to stop the tour and to interact with Ordino.
          Please note that the tour will load a new analysis session and the current
          one will be discarded.
        </p>
        `,
      },
      {
        selector: 'ul[data-header="mainMenu"] > li:first-child > a',
        html: `They start by opening the dataset tab, in order to find the relevant dataset to begin working with.`,
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
          await TourUtils.waitFor('.ordino-dataset.genes-dataset').then(async () => {
            TourUtils.click('#ordino_dataset_tab > .ordino-scrollspy-nav > a:nth-child(1)');
            await TourUtils.wait(1000);
          });
        },
      },
      {
        selector: '.ordino-dataset.cellline-dataset [data-testid="all-button"]',
        html: `They open the list of ALL cell lines.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
        pageBreak: 'manual',
      },
      {
        selector: '[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span',
        html: `<p>They add a single gene score for the following:</p>
        <p>Gene: TP53<p/>
        <p>Data Type: AA Mutated and AA Mutation<p/>`,
        placement: 'centered',
        preAction: async () => {
          await TourUtils.waitFor('.le-tr:nth-of-type(1)', Infinity).then(() => TourUtils.wait(1500));
          openAddColumPanel();
        },
        postAction: async () => {
          TourUtils.click('[data-testid="add-column-button"]');
          await TourUtils.wait(500);
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          await TourUtils.waitFor('.modal.show');

          TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'TP53;', 'input');
          await TourUtils.wait(500);

          // Check if data types were remembered and remove
          while (document.querySelector('[data-testid="Data Type"] span.select2-selection__choice__remove') !== null) {
            TourUtils.click('[data-testid="Data Type"] span.select2-selection__choice__remove:nth-of-type(1)');
          }

          // Now check if the pesky dropdown menu has shown up, and remove
          if (document.querySelector('span.select2-dropdown') !== null) {
            TourUtils.click('[data-testid="Data Type"] .select2-search--inline > input.select2-search__field');
          }
          await TourUtils.wait(200);

          // KNOWN BUG: (Sometimes) If either of the following options were selected the last time a single gene score column was added, they won't be
          // selected when running this tour the first time around. This can be fixed by simply restarting the tour.

          const selection1 = document.querySelector('option[value="mutation-aa_mutated"]');
          selection1.setAttribute('selected', 'selected');

          const selection2 = document.querySelector('option[value="mutation-aamutation"]');
          selection2.setAttribute('selected', 'selected');

          await TourUtils.wait(1500);
          TourUtils.click('.modal.show .modal-footer button[type=submit]');
        },
      },
      {
        selector: '[data-testid="viewWrapper-0"] [data-id="col7"] .lu-action-filter',
        html: `They once again filter out the samples with an unknown TP53 mutation status.`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.le-tr:nth-of-type(1) [data-id="col8"].lu-missing', Infinity),
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
        <p>Filter: Gene Symbol = AEN, BAX, CCNG1, CDKN1A, DDB2, FDXR, MDM2, RPS27L, RRM2B, SESN1, TNFRSF10B, XPC,
        ZMAT3 </p>
        <p>Data Type: Expression (TPM)</p>
        <p>Aggregation: Average</p>
        <p>Compute score for all cell lines, not only the selected subset</p>`,
        placement: 'centered',
        preAction: async () => {
          await TourUtils.waitFor('.le-tr:nth-of-type(1) [data-id="col7"] [style="background-color: rgb(27, 166, 78);"]', Infinity);
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
          TourUtils.setValueAndTrigger(
            '.modal-dialog [data-testid="row-2"] .select2 input',
            'AEN,BAX,CCNG1,CDKN1A,DDB2,FDXR,MDM2,RPS27L,RRM2B,SESN1,TNFRSF10B,XPC,ZMAT3',
            'input',
          );
          await TourUtils.wait(1020);

          TourUtils.setValueAndTrigger('.show .modal-body form > .col-sm-12:nth-child(2) select', 'expression-tpm', 'change');
          TourUtils.setValueAndTrigger('.show [data-testid="aggregation"] select', 'avg', 'change');

          // Inspect if the checkbox is checked, if so then uncheck it
          const checkboxTest = document.querySelector('.modal-dialog [data-testid="form-checkbox"]') as HTMLInputElement;
          if (checkboxTest?.checked) {
            TourUtils.click('.modal-dialog [data-testid="form-checkbox"]');
          }
          await TourUtils.wait(1000);
          TourUtils.click('.modal.show .modal-footer button[type=submit]');
        },
      },
      {
        selector: '[data-id="col9"] > .lu-toolbar > .lu-action-more',
        html: `<p>They decide to rename the new column to "TP53 Predictor Score".</p>`,
        placement: 'centered',
        postAction: async () => {
          TourUtils.click('[data-id="col9"] > .lu-toolbar > .lu-action-more');
          await TourUtils.wait(500);
          TourUtils.click('.lu-action-rename > span');
          await TourUtils.waitFor('.lu-dialog-rename input[placeholder="name"]');
          TourUtils.setValueAndTrigger('.lu-dialog-rename input[placeholder="name"]', 'TP53 Predictor Score', 'change');
          await TourUtils.wait(500);
          TourUtils.click('.lu-dialog-buttons > [type="submit"]');
        },
      },
      {
        selector: '[data-id="col9"] .lu-action-filter',
        html: `They now filter out the samples with an unknown TP53 Predictor Score &hellip;`,
        placement: 'centered',
        postAction: async () => {
          TourUtils.click('[data-id="col9"] .lu-action-filter');
          await TourUtils.wait(500);
          TourUtils.click('.lu-dialog .lu-checkbox input');
          await TourUtils.wait(500);
          TourUtils.click('.lu-dialog-button[type="submit"]');
        },
      },
      {
        selector: '[data-id="col9"] .lu-action-sort',
        html: `&hellip; and sort by this column.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.le-tbody.le-tbody',
        html: `<p>Observe: There is a clear enrichment of TP53 non-mutated among the cell lines with high score.</p>`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('[data-id="col9"].lu-renderer-number', Infinity),
        postAction: async () => {
          await TourUtils.wait(500);
        },
      },
      {
        selector: '[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(4) > span',
        html: `<p>Next, they choose to add a 'Depletion Screen Score (Single)' using the following:</p>
        <p>Gene: MDM2</p>
        <p>Data type: DRIVE RSA (NB: the lower this value, the more sensitive a cell line is to the depletion of the gene of interest)</p>`,
        placement: 'centered',
        preAction: openAddColumPanel,
        postAction: async () => {
          TourUtils.click('.lu-side-panel-wrapper .lu-adder > button');
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(4) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          await TourUtils.waitFor('.modal.show').then(() => TourUtils.wait(500));
          TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'MDM2;', 'input');
          TourUtils.setValueAndTrigger('.show .col > select', 'depletion-rsa', 'change');
          const checkboxTest = document.querySelector('.modal-dialog [data-testid="form-checkbox"]') as HTMLInputElement;
          if (!checkboxTest.checked) {
            TourUtils.click('.modal-dialog [data-testid="form-checkbox"]');
          }
          await TourUtils.wait(1000);
          TourUtils.click('.modal.show .modal-footer button[type=submit]');
        },
      },
      {
        selector: '[data-id="col10"] > .lu-toolbar > .lu-action-more',
        html: `<p>To amplify the visibility of the added depletion score's significance, they decide to invert the scaling via the data mapping.</p>`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.le-tr [data-id="col10"].lu-renderer-number', Infinity),
        postAction: async () => {
          TourUtils.click('[data-id="col10"] > .lu-toolbar > .lu-action-more');
          await TourUtils.wait(500);
          TourUtils.click('.lu-action-data-mapping > span');
          TourUtils.setValueAndTrigger('.browser-default', 'linear_invert', 'change');
          await TourUtils.wait(500);
          TourUtils.click('.lu-dialog-buttons > [type="submit"]');
        },
      },
      {
        selector: '[data-id="col10"] .lu-action-filter',
        html: `They filter out this MDM2 column's missing values &hellip;`,
        placement: 'centered',
        postAction: async () => {
          TourUtils.click('[data-id="col10"] .lu-action-filter');
          await TourUtils.wait(500);
          TourUtils.click('.lu-dialog .lu-checkbox input');
          await TourUtils.wait(500);
          TourUtils.click('.lu-dialog-button[type="submit"]');
        },
      },
      {
        selector: '[data-id="col10"] .lu-action-sort',
        html: `&hellip; and sort by this column.`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.le-tr:nth-of-type(1) [title="−1.00"]', Infinity),
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.le.le-multi.lineup-engine',
        html: `<p>Observe: Small MDM2 RSA values (large bars) are correlated to the expression score (TP53 Predictor Score) and the TP53 mutation status</p>`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.le-tr:nth-of-type(1) [title="−7.14"]', Infinity),
        postAction: () => TourUtils.wait(500),
      },
      // Can't do the drag operation for this final step in the aim
      // Remaining two aims are also primarily just observations, but rely on the combined score column; What to do?
      {
        selector: ['section[data-col-id="col9"]', 'section[data-col-id="col10"]'],
        html: `<p>Conclusion: When combining the TP53 Predictor Score column and the MDM2 Gene Sensitivity Score, the new weighted sum column serves as an even more accurate predictor.</p>
        <p>Thanks for joining this tour taking a deeper look into the TP53 Predictor Score.</p>
        <p>There are still many more features to discover. Enjoy!</p>`,
        placement: 'centered',
      },
    ];
  }
}
