import {IStep} from 'tdp_core';
import {TourUtils} from 'tdp_core';

export class AddColumnToGeneListTour {

  static createTour(): IStep[] {
    return [
      {
        html: `
        <p>Welcome to this short tour providing an overview of how to add data columns in Ordino!</p>
        <p>In this example we will add data columns to a list of genes. However, the steps are the same for cell line and tissue sample lists.</p>

        <p>
          Use the "Next" button or the "Return" key to iterate through all the steps. You can use the
          <i>"Cancel"</i> button at any time to stop the tour and to interact with Ordino.
          Please note that the tour will load a new analysis session and the current
          one will be discarded.
        </p>`,
      },
      {
        selector: 'ul[data-header="mainMenu"] > li:first-child > a',
        html: `<p>In order to load a list of genes we open the datasets tab by clicking on the <i>'Datasets'</i> button in the header.</p>`,
        placement: 'centered',
        preAction: () => {
          const datasetTab = document.querySelector('ul[data-header="mainMenu"] > li:nth-child(1)') as HTMLElement;
          if (datasetTab.classList.contains('active')) {
            return;
          }
          datasetTab.querySelector('a').click();
        }
      },
      {
        selector: '#ordino_dataset_tab > .ordino-scrollspy-container .genes-dataset > .card',
        html: `<p>In the datasets tab, we scroll to the <i>'Genes'</i> section &hellip;</p>`,
        placement: 'centered',
        preAction: TourUtils.waitForSelector,
        postAction: () => TourUtils.click('#ordino_dataset_tab > .ordino-scrollspy-nav > a:nth-child(2)'),
      },
      {
        selector: '.ordino-dataset.genes-dataset .dataset-entry button[title^="Name: Cancer Gene Census"]',
        html: `<p>&hellip; and afterwards we select the already predefined set of known cancer genes, called <i>'Cancer Gene Census'</i>.</p>`,
        placement: 'centered',
        postAction: () => {
          return TourUtils.waitFor('.ordino-dataset.genes-dataset .dataset-entry button[title^="Name: Cancer Gene Census"]').then(TourUtils.click);
        },
        pageBreak: 'manual'
      },


      {
        selector: '.le.le-multi.lineup-engine',
        placement: 'centered',
        html: `<p>Consequently, this opens the list of known cancer genes, including some basic information about them.</p>
        <p>Now we can start adding additional data columns to the list.</p>`,
        preAction: () => TourUtils.waitFor('.le.le-multi.lineup-engine', Infinity).then(() => TourUtils.wait(500))
      },

      {
        selector: '.lu-side-panel-wrapper button.fa-plus',
        html: `Additional columns can be added using the plus sign.`,
        placement: 'centered',
        postAction: TourUtils.clickSelector
      },

      {
        selector: '.lu-search ul',
        html: `<p>There a multiple types of columns you can add.</p>
        <p>In this tour we will look into <i>Annotation</i> and <i>Score</i> columns.</p>
        <ul><li><i>Annotation</i> columns provide some general information about the entities in your list (e.g., the strand of all genes)</li>
        <li><i>Score</i> columns, on the other hand, include (experimental) data about the entities in your list
        (e.g., the expression of the genes in a selected cell line)</li></ul>`,
        placement: 'centered'
      },

      {
        selector: '.lu-search .lu-search-item',
        html: `First, we want to add an annotation column`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('.lu-search .lu-search-item');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
        }
      },

      {
        selector: '.modal.show .form-group > .select2',
        html: `<p>This opens a dialog where you can select which information you want to add as a new column.</p>
        <p>In this example, we select <i>'Strand'</i> &hellip;</p>`,
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
        selector: '.lu-search .lu-search-group',
        html: `<p>Now, we want to add some score columns.</p>
        <p>For gene lists, there are the following three types available:</p>
        <ul><li><i>Cell Line Score Columns</i>: allows to add gene expression, copy number, and mutation data for cell lines of interest.</li>
        <li><i>Tissue Sample Score Columns</i>: allows to add gene expression, copy number, and mutation data for tissue samples of interest (TCGA, GTEx, PDX).</li>
        <li><i>Depletion Screen Score Columns</i>: allows to add CRISPR / RNAi screen results for cell lines of interest.</li></ul>
        <p>Each type exists in the following two variants:</p>
        <ul><li><i>Single</i>. For each selected cell line or tissue sample an individual column gets added.
        For instance, one can add a column that shows the gene expression values for the cell line <i>BT-20</i>.</li>
        <li><i>Aggregated</i>. This allows to aggregate the information across multiple cell lines or tissue samples.
        For instance, one can add a column that shows the average gene expression values across all breast cancer cell lines.</li></ul>`,
        placement: 'centered',
        preAction: async () => {
          await TourUtils.waitFor('.lu-search .lu-search-group');
          TourUtils.click('.lu-side-panel-wrapper button.fa-plus');
        }
      },

      {
        selector: '.lu-search .lu-search-group .lu-search-item',
        placement: 'centered',
        html: `Now, we want to add two columns containing the copy number information of two specific cell lines. To do so, we open the <i>'Cell Line Score (Single)'</i> dialog`,
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
          TourUtils.setValueAndTrigger('.mb-3 > select', 'copy_number-relativecopynumber', 'change');
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
        html: `The copy number information for each selected cell line has been added as an additional columns`,
      },

      {
        selector: '.lu-search .lu-search-group .lu-search-item:nth-child(2)',
        placement: 'centered',
        html: `Finally, we want to add an aggregated column containing the mean/average copy number values of all breast cancer cell lines.
        To do so, we open the <i>'Cell Line Score (Aggregated)'</i> dialog`,
        preAction: () => {
          TourUtils.click('.lu-side-panel-wrapper button.fa-plus');
        },
        postAction: () => {
          TourUtils.click('.lu-search .lu-search-group .lu-search-item:nth-child(2)');
          TourUtils.toggleClass('.lu-adder.once', 'once', false);
        }
      },

      {
        selector: '.modal.show .modal-content',
        html: `<p>This opens a dialog where you can specify the settings for the new column.</p>`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.modal.show .modal-content').then(() => TourUtils.wait(250))
      },

      {
        selector: '.modal-body form > .form-group:nth-child(1) .form-row:nth-child(1) div:nth-child(1) select',
        html: `<p>First, we need to define the subset of cell lines which we want to aggregate.</p>
        <p>For the filter attribute we select <i>'Tumor Type'</i> &hellip;</p>`,
        placement: 'centered',
        postAction: () => {
          TourUtils.setValueAndTrigger('.modal-body form > .form-group:nth-child(1) .form-row:nth-child(1) div:nth-child(1) select', 'tumortype', 'change');
        }
      },

      {
        selector: '.modal-body form > .form-group:nth-child(1) .form-row:nth-child(1) div:nth-child(2) .select2',
        html: `&hellip; and for the filter value we select <i>'breast carcinoma'</i>.`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.modal-body form > .form-group:nth-child(1) .form-row:nth-child(1) div:nth-child(2) .select2').then(() => TourUtils.wait(250)),
        postAction: () => {
          TourUtils.setValueAndTrigger('.modal-body form > .form-group:nth-child(1) .form-row:nth-child(1) div:nth-child(2) select', 'breast carcinoma', 'change');
        }
      },

      {
        selector: '.modal-body form > .mb-3:nth-child(2) .select2',
        placement: 'centered',
        html: `As data type, we choose <i>'Relative Copy Number'</i> &hellip;`,
        postAction: () => {
          TourUtils.setValueAndTrigger('.modal-body form > .mb-3:nth-child(2) select', 'copy_number-relativecopynumber', 'change');
        }
      },

      {
        selector: '.modal-body form > .mb-3:nth-child(3) select',
        placement: 'centered',
        html: `<p>&hellip; and as type of aggregation we choose <i>'Average'</i></p>
        <p>FYI: other types of aggregation are, for instance, <i>'Min'</i>, <i>'Max'</i>, <i>'Median'</i>, <i>'Count'</i>, and <i>'Boxplot'</i>.`,
        postAction: () => {
          TourUtils.setValueAndTrigger('.modal-body form > .mb-3:nth-child(3) > select', 'avg', 'change');
        }
      },

      {
        selector: '.modal.show .modal-footer button[type=submit]',
        html: `Finally, we click <i>'Add'</i>`,
        placement: 'centered',
        postAction: TourUtils.clickSelector
      },

      {
        selector: '.le header section[title^=avg]',
        placement: 'centered',
        preAction: () => TourUtils.waitFor('.le header section[title^=avg]', 30000),
        html: `The information about the average copy number of all breast cancer cell lines for each gene has been added as an additional column`,
      },

      {
        html: `<p>With this we are at the end of the short tour demonstrating how to add columns in Ordino. Thanks for joining!</p>
        <p>There are many more features to discover. Enjoy!</p>`,
      },
    ];
  }
}
