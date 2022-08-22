import { IStep, TourUtils } from 'tdp_core';

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
        preAction: () => TourUtils.waitFor('.modal.show').then(() => TourUtils.wait(250)),
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
          TourUtils.setValueAndTrigger('.col > select', 'copy_number-relativecopynumber', 'change');
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
        preAction: () => TourUtils.waitFor('.modal.show').then(() => TourUtils.wait(250)),
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
          TourUtils.setValueAndTrigger('.col > select', 'expression-tpm', 'change');
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
        preAction: () => TourUtils.waitFor('.modal.show').then(() => TourUtils.wait(250)),
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
          TourUtils.setValueAndTrigger('.col > select', 'depletion-rsa', 'change');
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
        selector: '.le.le-multi.lineup-engine',
        placement: 'centered',
        html: `TOUR IS HERE SO FAR.`,
      },
      {
        selector: '.le header section[title^=HCC] i[title^=Sort]',
        placement: 'centered',
        html: `For example, you can use this icon to sort all genes by their copy number in the cell line <i>'HCC-827'</i>`,
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.le-tr[data-index="0"]',
        placement: 'centered',
        html: `In order to obtain additional information about one or more genes, click on the respective line or use the checkboxes`,
        preAction: () =>
          TourUtils.waitFor(() => {
            const r = document.querySelector<HTMLElement>('.le-tr[data-index="0"]');
            if (!r) {
              return null;
            }
            // has a string renderered EGFR entry
            if (!Array.from(r.querySelectorAll<HTMLElement>('div[data-renderer="string"]')).some((d) => d.textContent === 'EGFR')) {
              return null;
            }
            return r;
          }, Infinity).then(() => TourUtils.wait(500)), // wait for animation to complete
        postAction: TourUtils.clickSelector,
      },
      {
        selector: '.viewWrapper .chooser:not(.hidden)',
        placement: 'centered',
        html: `Various 'Detail Views', providing additional information, are available.`,
        preAction: TourUtils.waitForSelector,
      },
      {
        selector: '.viewWrapper .chooser button[data-viewid="celllinedb_expression_vs_copynumber"]',
        placement: 'centered',
        html: `For instance, clicking on <i>'Expression vs Copy Number'</i> opens a scatter plot showing the relation of the two types of data`,
        postAction: TourUtils.clickSelector,
      },
      {
        html: `<p>Thanks for joining this tour demonstrating the basic features of Ordino.</p>
        <p>There are many more features to discover. Enjoy!</p>`,
      },
    ];
  }
}
