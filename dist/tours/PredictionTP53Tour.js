// import {ToursSection} from 'ordino';
import { TourUtils } from 'tdp_core';
export class PredictionTP53Tour {
    static createTour() {
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
                    const datasetTab = document.querySelector('ul[data-header="mainMenu"] > li:nth-child(1)');
                    if (!datasetTab.classList.contains('active')) {
                        datasetTab.querySelector('a').classList.add('hover');
                    }
                },
                postAction: () => {
                    const datasetTab = document.querySelector('ul[data-header="mainMenu"] > li:nth-child(1)');
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
                html: `<p>12To create a set with these specific genes, they add each gene into the highlighted field.</p>`,
                placement: 'centered',
                postAction: () => {
                    // TourUtils.click('.ordino-dataset.genes-dataset .show .ordino-dataset-searchbox input');
                    // TourUtils.setValueAndTrigger('.ordino-dataset.genes-dataset .show .ordino-dataset-searchbox input', 'AEN;', 'input');
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
//# sourceMappingURL=PredictionTP53Tour.js.map