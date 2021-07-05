import {IStep} from 'tdp_core';
import {TourUtils} from 'tdp_core';

export class WelcomeTour {

  static createTour(): IStep[] {
    return [
      {
        html: `<p>Welcome to this short tour showing the basic features of Ordino!</p>
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
        pageBreak: 'manual'
      },
      {
        selector: '.ordino-dataset.genes-dataset > .card',
        html: `<p>You can choose between the three entity types <i>'Cell Lines'</i>, <i>'Tissue Samples'</i>, and <i>'Genes'</i>.</p> <p>In this example we will work with a list of genes</p>`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('#ordino_dataset_tab > .ordino-scrollspy-container .genes-dataset > .card').then(() => TourUtils.wait(400)),
        postAction: () => TourUtils.click('.ordino-dataset.genes-dataset .session-tab > li:first-child')
      },
      {
        selector: '.ordino-dataset.genes-dataset .dataset-entry',
        html: `Of the available predefined gene sets, we open a list of known cancer genes, called <i>'Cancer Gene Census'</i>`,
        placement: 'centered',
        postAction: () => {
          return TourUtils.waitFor('.ordino-dataset.genes-dataset .dataset-entry button[title^="Name: Cancer Gene Census"]').then(TourUtils.click);
        },
        pageBreak: 'manual'
      },
      {
        selector: '.le.le-multi.lineup-engine',
        placement: 'centered',
        html: `The information is presented in a tabular format. Additionally to the gene ID, a set of columns containing some basic information is shown by default.`,
        preAction: () => TourUtils.waitFor('.le.le-multi.lineup-engine', Infinity).then(() => TourUtils.wait(600))
      },
      {
        selector: '.lu-side-panel-wrapper button.fa-plus',
        html: `Additional columns can be added using the plus sign.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector
      },
      {
        selector: '.lu-search .lu-search-item',
        html: `First, we want to add a metadata column`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('.lu-search .lu-search-item');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
        }
      },
      {
        selector: '.modal.show .form-group > .select2',
        html: `Here we select <i>'Strand'</i> &hellip;`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.modal.show').then(() => TourUtils.wait(250)),
        postAction: () => TourUtils.setValueAndTrigger('.form-group > select', 'strand', 'change')
      },
      {
        selector: '.modal.show .modal-footer button[type=submit]',
        html: `&hellip; and click <i>'Add'</i>`,
        placement: 'centered',
        postAction: TourUtils.clickSelector
      },
      {
        selector: '.le header section[title=Strand]',
        placement: 'centered',
        html: `The strand information was added as a new column`,
        preAction: TourUtils.waitForSelector
      },
      {
        selector: '.lu-search .lu-search-group .lu-search-item',
        placement: 'centered',
        html: `Now, we want to add two columns containing the copy number information of two specific cell lines. To do so, we open the <i>'Cell Line Score'</i> dialog`,
        preAction: () => {
          TourUtils.click('.lu-side-panel-wrapper button.fa-plus');
        },
        postAction: () => {
          TourUtils.click('.lu-search .lu-search-group .lu-search-item');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
        }
      },
      {
        selector: '.modal.show .form-group > .select3',
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.modal.show').then(() => TourUtils.wait(250)),
        html: `We select the cell lines <i>'HCC-827'</i> and <i>'BT-20'</i>.`,
        postAction: () => {
          TourUtils.setValueAndTrigger('.modal.show .select3 input.select2-search__field', 'HCC-827;BT-20;', 'input');
        }
      },
      {
        selector: '.modal.show .form-group > .select2',
        placement: 'centered',
        html: `As data type, we choose <i>'Relative Copy Number'</i>`,
        postAction: () => {
          TourUtils.setValueAndTrigger('.form-group > select', 'copy_number-relativecopynumber', 'change');
        }
      },
      {
        selector: '.modal.show .modal-footer button[type=submit]',
        html: `Finally, click <i>'Add'</i>`,
        placement: 'centered',
        postAction: TourUtils.clickSelector
      },
      {
        selector: ['.le header section[title^=BT], .le header section[title^=HCC]'],
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.le header section[title^=BT]', 10000),
        html: `The copy number information for each selected cell line has been added as additional columns`,
      },
      {
        selector: '.le > header',
        placement: 'centered',
        html: `The column headers can be used to sort and filter the list of genes based on any of the available data`,
      },
      {
        selector: '.le header section[title^=HCC] i[title^=Sort]',
        placement: 'centered',
        html: `For example, you can use this icon to sort all genes by their copy number in the cell line <i>'HCC-827'</i>`,
        postAction: TourUtils.clickSelector
      },
      {
        selector: '.le-tr[data-index="0"]',
        placement: 'centered',
        html: `In order to obtain additional information about one or more genes, click on the respective line or use the checkboxes`,
        preAction: () => TourUtils.waitFor(() => {
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
        postAction: TourUtils.clickSelector
      },
      {
        selector: '.viewWrapper .chooser:not(.hidden)',
        placement: 'centered',
        html: `Various 'Detail Views', providing additional information, are available.`,
        preAction: TourUtils.waitForSelector
      },
      {
        selector: '.viewWrapper .chooser button[data-viewid="celllinedb_expression_vs_copynumber"]',
        placement: 'centered',
        html: `For instance, clicking on <i>'Expression vs Copy Number'</i> opens a scatter plot showing the relation of the two types of data`,
        postAction: TourUtils.clickSelector
      },
      {
        html: `<p>Thanks for joining this tour demonstrating the basic features of Ordino.</p>
        <p>There are many more features to discover. Enjoy!</p>`,
      },
    ];
  }
}
