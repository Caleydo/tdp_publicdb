// import {ToursSection} from 'ordino';
import { IStep, Tour } from 'tdp_core';
import { TourUtils } from 'tdp_core/src/tour/TourUtils';
import selectEvent from 'react-select-event';
import { wideEnoughCat } from 'lineupjs/build/src/renderer/utils';

export class PredictionTP53Tour {
  static createTour(): IStep[] {
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
        html: `<p>Here they choose between the three entity types <i>'Cell Lines'</i>, <i>'Tissue Samples'</i>, and <i>'Genes'</i>.</p>
        <p>In this example they choose to work with a list of 13 specific genes.</p>`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('#ordino_dataset_tab > .ordino-scrollspy-container .genes-dataset > .card').then(() => TourUtils.wait(600)),
        postAction: () => TourUtils.click('.ordino-dataset.genes-dataset .session-tab > li:first-child'),
      },
      {
        selector: '.ordino-dataset.genes-dataset .show .ordino-dataset-searchbox',
        html: `<p>To create a set with these specific genes, they add each gene into the highlighted field.</p>`,
        placement: 'centered',
        allowUserInteraction: true,
        postAction: async () => {
          selectEvent.openMenu(document.querySelector<HTMLElement>('[id="react-select-6-input"]'));

          selectEvent.create(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), 'AEN');
          selectEvent.select(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), ['AEN']);
          await TourUtils.waitFor('[data-testid="async-paginate-multiselect-remove-ENSG00000181026"]');

          selectEvent.create(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), 'BAX');
          selectEvent.select(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), ['BAX']);
          await TourUtils.waitFor('[data-testid="async-paginate-multiselect-remove-ENSG00000087088"]');

          selectEvent.create(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), 'CCNG1');
          selectEvent.select(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), ['CCNG1']);
          await TourUtils.waitFor('[data-testid="async-paginate-multiselect-remove-ENSG00000218991"]');

          selectEvent.create(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), 'CDKN1A');
          selectEvent.select(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), ['CDKN1A']);
          await TourUtils.waitFor('[data-testid="async-paginate-multiselect-remove-ENSG00000124762"]');

          selectEvent.create(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), 'DDB2');
          selectEvent.select(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), ['DDB2']);
          await TourUtils.waitFor('[data-testid="async-paginate-multiselect-remove-ENSG00000134574"]');

          selectEvent.create(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), 'FDXR');
          selectEvent.select(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), ['FDXR']);
          await TourUtils.waitFor('[data-testid="async-paginate-multiselect-remove-ENSG00000161513"]');

          selectEvent.create(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), 'MDM2');
          selectEvent.select(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), ['MDM2']);
          await TourUtils.waitFor('[data-testid="async-paginate-multiselect-remove-ENSG00000135679"]');

          selectEvent.create(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), 'RPS27L');
          selectEvent.select(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), ['RPS27L']);
          await TourUtils.waitFor('[data-testid="async-paginate-multiselect-remove-ENSG00000185088"]');

          selectEvent.create(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), 'RRM2B');
          selectEvent.select(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), ['RRM2B']);
          await TourUtils.waitFor('[data-testid="async-paginate-multiselect-remove-ENSG00000048392"]');

          selectEvent.create(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), 'SESN1');
          selectEvent.select(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), ['SESN1']);
          await TourUtils.waitFor('[data-testid="async-paginate-multiselect-remove-ENSG00000080546"]');

          selectEvent.create(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), 'TNFRSF10B');
          selectEvent.select(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), ['TNFRSF10B']);
          await TourUtils.waitFor('[data-testid="async-paginate-multiselect-remove-ENSG00000120889"]');

          selectEvent.create(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), 'XPC');
          selectEvent.select(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), ['XPC']);
          await TourUtils.waitFor('[data-testid="async-paginate-multiselect-remove-ENSG00000154767"]');

          selectEvent.create(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), 'ZMAT3');
          selectEvent.select(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), ['ZMAT3']);
          await TourUtils.waitFor('[data-testid="async-paginate-multiselect-remove-ENSG00000172667"]');
        },
      },
      {
        selector: '.ordino-dataset.genes-dataset .show [data-testid="save-button"]',
        html: `Once the genes have been added, they choose to save these genes as a custom set called 'TP53 Predictor'.`,
        placement: 'centered',
        postAction: async () => {
          // Checks for an existing set called 'TP53 Predictor'
          // If this named set already exists but with different genes, then the tour will erroneously continue
          if (document.querySelector('[data-testid="tp53-predictor-button"]') !== null) {
            TourUtils.click('[data-testid="async-paginate-clearindicator"]');
          } else {
            TourUtils.click('#dataset-panel-human-5 [data-testid="save-button"]');
            await TourUtils.wait(1000); //
            TourUtils.setValueAndTrigger('[data-testid="name-input"]', 'TP53 Predictor', 'input');
            TourUtils.click('[data-testid="primary-dialog-button"]');
            // TourUtils.click('[data-testid="save-list-of-entities"] [data-testid="close-button"]')
          }
        },
      },
      {
        // BUGGED: Doesn't scroll up
        selector: '.ordino-dataset.tissue-dataset > .card',
        html: `Next they aim to test the applicability of gene signature using TCGA tumor samples.`,
        placement: 'centered',
        preAction: () => TourUtils.click('#ordino_dataset_tab > .ordino-scrollspy-nav > a:nth-child(2)'),
      },
      {
        selector: '.ordino-dataset.tissue-dataset [data-testid="tcga-tumors-button"]',
        html: `They start by opening a list of all TCGA tumors.`,
        placement: 'centered',
        // preAction: () => TourUtils.waitFor('#ordino_dataset_tab > .ordino-scrollspy-container .tissue-dataset > .card').then(() => TourUtils.wait(600)),
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
        selector: '[data-testid="add-column-button"]',
        html: `<p>Now they add a single gene score for the following:</p>
        <p>Gene: TP53<p/>
        <p>Data Type: AA Mutated<p/>`,
        placement: 'centered',
        postAction: async () => {
          TourUtils.click('[data-testid="add-column-button"]');
          await TourUtils.wait(500);
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span');
          // await TourUtils.wait(500);
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          TourUtils.waitFor('.modal.show').then(async () => {
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
        postAction: async () => {
          TourUtils.click('[data-testid="viewWrapper-0"] [data-id="col7"] .lu-action-filter');
          await TourUtils.wait(500);
          TourUtils.click('.lu-dialog > .lu-checkbox input');
          await TourUtils.wait(500);
          TourUtils.click('.lu-dialog-button[type="submit"]');
        },
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `<p>Next they add an aggregated gene score with the following criteria:</p>
        <p>Filter: My Named Sets = TP53 Predictor</p>
        <p>Data Type: Expression (TPM)</p>
        <p>Aggregation: Average</p>
        <p>Compute score only for current sample subset</p>`,
        placement: 'centered',
        postAction: async () => {
          TourUtils.click('.lu-side-panel-wrapper .lu-adder > button');
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          await TourUtils.wait(500);
          TourUtils.setValueAndTrigger('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select', 'namedset4ensg', 'change');
          await TourUtils.wait(1000);
          // TourUtils.click('.modal-dialog [data-testid="row-1"] .select2 input');
          // selectEvent.create(document.querySelector<HTMLElement>('.modal-dialog [data-testid="row-1"] .select2 input'), 'TP53 Predictor');
          TourUtils.setValueAndTrigger('.modal-dialog [data-testid="row-1"] .select2 input', 'TP53 Predictor', 'input');
          TourUtils.keyDownEnter('.modal-dialog [data-testid="row-1"] .select2 input');
          // selectEvent.select(document.querySelector<HTMLElement>('.modal-dialog [data-testid="row-1"] .select2 input'), ['TP53 Predictor']);
          // TourUtils.click('.select2-results__options li:first-child');
          TourUtils.setValueAndTrigger('.show .modal-body form > .col-sm-12:nth-child(2) select', 'expression-tpm', 'change');
          TourUtils.setValueAndTrigger('.show [data-testid="aggregation"] select', 'avg', 'change');
          TourUtils.click('[data-testid="form-checkbox"]');
          await TourUtils.wait(500);
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
      }, // Comment out til here to remove first section
      {
        selector: 'ul[data-header="mainMenu"] > li:first-child > a',
        html: `Next, they aim to test the applicability of gene signature and MDM2 sensitivity using all cell lines.`,
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
          return TourUtils.waitFor('.ordino-dataset.genes-dataset').then(() => TourUtils.click('#ordino_dataset_tab > .ordino-scrollspy-nav > a:nth-child(1)'));
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
        selector: '[data-testid="add-column-button"]',
        html: `<p>They add a single gene score for the following:</p>
        <p>Gene: TP53<p/>
        <p>Data Type: AA Mutated and AA Mutation<p/>`,
        placement: 'centered',
        postAction: async () => {
          TourUtils.click('[data-testid="add-column-button"]');
          await TourUtils.wait(500);
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          TourUtils.waitFor('.modal.show').then(async () => {
            if (document.querySelector('[data-testid="data-type"] .select2-selection__clear') !== null) {
              TourUtils.click('[data-testid="data-type"] .select2-selection__clear');
              TourUtils.click('label[data-testid="Data Type"]'); // Just click anywhere safe to get rid of dropdown
            }
            TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'TP53;', 'input');
            TourUtils.setValueAndTrigger('.show .col > select', 'mutation-aa_mutated', 'input');
            await TourUtils.wait(500);
            TourUtils.click('.modal.show .modal-footer button[type=submit]');
          });
          await TourUtils.wait(1500);
          // Repeat again for the AA Mutation Column
          TourUtils.click('[data-testid="add-column-button"]');
          await TourUtils.wait(500);
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(1) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          TourUtils.waitFor('.modal.show').then(async () => {
            if (document.querySelector('[data-testid="data-type"] .select2-selection__clear') !== null) {
              TourUtils.click('[data-testid="data-type"] .select2-selection__clear');
              TourUtils.click('label[data-testid="Data Type"]');
            }
            TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'TP53;', 'input');
            TourUtils.setValueAndTrigger('.show .col > select', 'mutation-aamutation', 'input');

            await TourUtils.wait(500);
            TourUtils.click('.modal.show .modal-footer button[type=submit]');
          });
        },
      },
      {
        selector: '[data-testid="viewWrapper-0"] [data-id="col7"] .lu-action-filter',
        html: `They once again filter out the samples with an unknown TP53 mutation status.`,
        placement: 'centered',
        postAction: async () => {
          TourUtils.click('[data-testid="viewWrapper-0"] [data-id="col7"] .lu-action-filter');
          await TourUtils.wait(500);
          TourUtils.click('.lu-dialog > .lu-checkbox input');
          await TourUtils.wait(500);
          TourUtils.click('.lu-dialog-button[type="submit"]');
        },
      },
      {
        selector: '.lu-side-panel-wrapper .lu-adder > button',
        html: `<p>Next they add the aggregated gene score with the following criteria again:</p>
        <p>Filter: My Named Sets = TP53 Predictor</p>
        <p>Data Type: Expression (TPM)</p>
        <p>Aggregation: Average</p>
        <p>Compute score for all cell lines</p>`,
        placement: 'centered',
        postAction: async () => {
          TourUtils.click('.lu-side-panel-wrapper .lu-adder > button');
          TourUtils.click('[data-testid=lu-adder-div] > .lu-search > .lu-search-list > :nth-child(2) > ul > :nth-child(2) > span');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
          await TourUtils.wait(500);
          if (document.querySelector('[data-testid="row-1"] [data-testid="close-button"]') !== null) {
            TourUtils.click('[data-testid="row-1"] [data-testid="close-button"]');
          }
          await TourUtils.wait(500);
          TourUtils.setValueAndTrigger('.show .modal-body form > div:nth-child(1) .row:nth-child(1) div:nth-child(1) select', 'namedset4ensg', 'change');
          await TourUtils.wait(1000);
          TourUtils.setValueAndTrigger('.modal-dialog [data-testid="row-1"] .select2 input', 'TP53 Predictor', 'input');
          TourUtils.keyDownEnter('.modal-dialog [data-testid="row-1"] .select2 input');
          TourUtils.setValueAndTrigger('.show .modal-body form > .col-sm-12:nth-child(2) select', 'expression-tpm', 'change');
          TourUtils.setValueAndTrigger('.show [data-testid="aggregation"] select', 'avg', 'change');
          /// ??? Uncomment the following line when the test is ready
          // TourUtils.click('[data-testid="form-checkbox"]'); // This is very risky, as we are assuming it was checked previously, which should be remembered by the cookies and thus clicking again would deselect (as desired)
          await TourUtils.wait(500);
          TourUtils.click('.modal.show .modal-footer button[type=submit]');
        },
      },
      {
        selector: '',
        html: `THE TOUR IS HERE SO FAR`,
        placement: 'centered',
      },
    ];
  }
}
