// import {ToursSection} from 'ordino';
import { IStep, Tour } from 'tdp_core';
import { TourUtils } from 'tdp_core/src/tour/TourUtils';
// import selectEvent from 'react-select-event';

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
        html: `<p>123To create a set with these specific genes, they add each gene into the highlighted field.</p>`,
        placement: 'centered',
        allowUserInteraction: true,
        preAction: () => {
          // TourUtils.click('#dataset-panel-human-5 [data-testid="async-paginate-dropdownindicator"]');
          // --------
          // const backdrop = document.querySelector('div.tdp-tour-back-disabled') as HTMLElement;
          // backdrop.style.display = 'none';
          // const backdropblocker = document.querySelector('div.tdp-tour-backdrop-blocker') as HTMLElement;
          // backdropblocker.style.display = 'none';
          // TourUtils.removeBlocker('div.tdp-tour-back-disabled');
          // TourUtils.removeBlocker('div.tdp-tour-backdrop-blocker');
          // -------------
          // TourUtils.setValueAndTrigger('div.css-1pahdxg-control', 'AEN', 'change');
          // --------------------
          // selectEvent.openMenu(document.querySelector<HTMLElement>('[id="react-select-6-input"]'));
          // // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          // TourUtils.waitFor('[id="react-select-6-option-0"]').then(() => {
          //   TourUtils.wait(3000)
          //     // .then(() => TourUtils.fireMouseDown('div.css-1pahdxg-control'))
          //     // .then(() => TourUtils.wait(3000))
          //     .then(() => {
          //       TourUtils.focus('div.css-1pahdxg-control');
          //       TourUtils.fireKeyPress('div.css-1pahdxg-control', 'a');
          //     });
          // });
        },
        postAction: () => {
          // TourUtils.focus(document.querySelector<HTMLElement>('[id="react-select-6-input"]'));
          // TourUtils.fireMouseDown(document.querySelector<HTMLSelectElement>('[id="react-select-6-input"]'));
          // TourUtils.fireKeyPress(document.querySelector<HTMLSelectElement>('[id="react-select-6-input"]'), 'A');
          // ---------------
          // selectEvent.select(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), "AEN");
          // selectEvent.select(document.querySelector<HTMLElement>('[id="react-select-6-input"]'), ['A1BG']);
          // ---------------
          // selectEvent.openMenu(document.querySelector<HTMLElement>('[id="react-select-6-input"]'));
          // // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          // TourUtils.waitFor('[id="react-select-6-option-0"]').then(() => {
          //   TourUtils.wait(3000)
          //     .then(() => TourUtils.fireMouseDown('[id="react-select-6-input"]'))
          //     .then(() => TourUtils.wait(3000))
          //     .then(() => TourUtils.fireKeyPress('[id="react-select-6-input"]', 'a'));
          // });
          // -------------------------
          // TourUtils.waitFor('[data-testid="async-paginate-multiselect-remove-ENSG00000121410"]').then(() => TourUtils.wait(1000));
          // TourUtils.removeBlocker('div.tdp-tour-back-disabled');
          // TourUtils.removeBlocker('div.tdp-tour-backdrop-blocker');
          // TourUtils.click('#dataset-panel-human-5 [data-testid="async-paginate-dropdownindicator"]');
          // ------------------
          // .then(() => TourUtils.click('[id="react-select-6-option-0"]'));"react-select-6-option-0"]').then(() => {
          //   TourUtils.wait(1000).then(() => {
          //     TourUtils.setValueAndTrigger('[id="react-select-6-input"]', 'AEN', 'change');
          //   });
          // });
          // TourUtils.setValueWithoutTrigger('[id="react-select-6-input"]', 'AEN');
          // TourUtils.click('[id="react-select-6-option-0"]');
          // div[class$="-MenuList"] #react-select-3-option-1
          // TourUtils.setValueAndTrigger('[id="react-select-6-input"]', 'AEN', 'input');
          // TourUtils.keyDownEnter('.ordino-dataset.genes-dataset .show .ordino-dataset-searchbox input');
        },
      },
      {
        selector: '.ordino-dataset.genes-dataset .show [data-testid="save-button"]',
        html: `Once the genes have been added, they choose to save these genes as a custom set.`,
        placement: 'centered',
        postAction: () => TourUtils.clickSelector,
      },
      {
        selector: '.ordino-dataset.tissue-dataset',
        html: `Next they aim to test the applicability of gene signature using TCGA tumor samples.`,
        placement: 'centered',
      },
      {
        selector: '.ordino-dataset.tissue-dataset [data-testid="tcga-tumors-button"]',
        html: `They start by opening a list of all TCGA tumors.`,
        placement: 'centered',
        postAction: () => TourUtils.clickSelector,
        pageBreak: 'manual',
      },
      {
        selector: '.le.le-multi.lineup-engine',
        placement: 'centered',
        html: `The information is presented in a tabular format. Additionally to the gene ID, a set of columns containing some basic information is shown by default.`,
        preAction: () => TourUtils.waitFor('.le.le-multi.lineup-engine', Infinity).then(() => TourUtils.wait(1500)),
      },
      {
        selector: '.le.le-multi.lineup-engine',
        placement: 'centered',
        html: `///The information is presented in a tabular format. Additionally to the gene ID, a set of columns containing some basic information is shown by default.`,
        preAction: () => TourUtils.waitFor('.le.le-multi.lineup-engine', Infinity).then(() => TourUtils.wait(1500)),
      },
      {
        selector: '',
        html: `THE TOUR IS HERE SO FAR`,
        placement: 'centered',
      },
    ];
  }
}
