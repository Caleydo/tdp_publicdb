import { TourUtils } from 'tdp_core';
export class StartMenuTour {
    static createTour() {
        return [
            {
                html: `<p>Welcome to this short tour providing an overview of the Ordino start menu!</p>
        <p>
          Use the "Next" button or the "Return" key to iterate through all the steps. You can use the
          <i>"Cancel"</i> button at any time to stop the tour and to interact with Ordino.
          Please note that the tour will load a new analysis session and the current
          one will be discarded.
        </p>`,
            },
            {
                selector: 'ul[data-header="mainMenu"]',
                html: `<p>The start menu allows you to select the dataset you want to analyze, allows you to save and load analysis sessions, and gives you access to the help tours.</p>
        <p>The menu consists of three tabs.</p>`,
                placement: 'centered',
                preAction: () => {
                    document.querySelectorAll('ul[data-header="mainMenu"] > li > a').forEach((link) => link.classList.add('hover'));
                },
                postAction: () => {
                    document.querySelectorAll('ul[data-header="mainMenu"] > li > a').forEach((link) => link.classList.remove('hover'));
                },
            },
            {
                selector: 'ul[data-header="mainMenu"] > li:first-child > a',
                html: `In the first tab, you can start a new analysis by selecting a dataset.`,
                placement: 'centered',
                preAction: async () => {
                    const datasetTab = document.querySelector('ul[data-header="mainMenu"] > li:nth-child(1)');
                    if (!datasetTab.classList.contains('active')) {
                        datasetTab.querySelector('a').click();
                    }
                    const selector = '#ordino_dataset_tab > .ordino-scrollspy-nav > a:nth-child(1)';
                    await TourUtils.waitFor(selector);
                    TourUtils.click(selector);
                    await TourUtils.wait(600); // wait until the page scrolls to top
                },
                pageBreak: 'manual',
            },
            {
                selector: '#ordino_dataset_tab > .ordino-scrollspy-container .cellline-dataset > .card',
                html: `<p>You can select cell lines, &hellip;</p>`,
                placement: 'centered',
                preAction: async () => {
                    await TourUtils.waitFor('#ordino_dataset_tab > .ordino-scrollspy-container .cellline-dataset > .card');
                },
                postAction: () => TourUtils.click('#ordino_dataset_tab > .ordino-scrollspy-nav > a:nth-child(2)'),
                pageBreak: 'manual',
            },
            {
                selector: '#ordino_dataset_tab > .ordino-scrollspy-container .tissue-dataset > .card',
                html: `<p>&hellip; tissue samples, &hellip;</p>`,
                placement: 'centered',
                preAction: () => TourUtils.waitFor('#ordino_dataset_tab > .ordino-scrollspy-container .tissue-dataset > .card').then(() => TourUtils.wait(600)),
                postAction: () => TourUtils.click('#ordino_dataset_tab > .ordino-scrollspy-nav > a:nth-child(3)'),
            },
            {
                selector: '#ordino_dataset_tab > .ordino-scrollspy-container .genes-dataset > .card',
                html: `<p>&hellip; or a set of genes to analyze.</p>`,
                placement: 'centered',
                preAction: () => TourUtils.waitFor('#ordino_dataset_tab > .ordino-scrollspy-container .genes-dataset > .card').then(() => TourUtils.wait(600)),
            },
            {
                selector: '#ordino_dataset_tab > .ordino-scrollspy-container .genes-dataset > .card .ordino-dataset-searchbox > div:first-child',
                html: `<p>For each of the three entity types you can either start with a manually defined set by adding ids
        (gene symbols, cell line names, or tissue sample ids) into the search field, or &hellip;</p>`,
                placement: 'centered',
                pageBreak: 'manual',
            },
            {
                selector: '.genes-dataset .tab-content .tab-pane .row:nth-child(2)',
                html: `<p>&hellip;  you can select an already defined set. There are three list: </p>
        <ul>
          <li><i>Predefined Sets</i> - These are already defined sets that are of general interest, including the set of all entities (e.g., the lists of all cell lines and all genes in our database).</li>
          <li><i>My Sets</i> - You can also define your own subsets of interesting/relevant genes, cell lines, etc. These will be listed here.</li>
          <li><i>Public Sets</i> - Entity subsets that other users created and shared with you show up in this list.</li>
        </ul>`,
                placement: 'centered',
                preAction: TourUtils.waitForSelector,
                postAction: () => TourUtils.click('#ordino_dataset_tab > .ordino-scrollspy-nav > a:nth-child(4)'),
                pageBreak: 'manual',
            },
            {
                selector: '#ordino_dataset_tab > .ordino-scrollspy-container div[id^="tdp_uploaded_dataset"] > .card',
                html: `<p>Additionally to loading an existing dataset, you can also upload your own data in a tabular format.</p>`,
                placement: 'centered',
                preAction: () => TourUtils.waitFor('#ordino_dataset_tab > .ordino-scrollspy-container div[id^="tdp_uploaded_dataset"] > .card').then(() => TourUtils.wait(400)),
                pageBreak: 'manual',
            },
            {
                selector: 'ul[data-header="mainMenu"] > li:nth-child(2) > a',
                html: `<p>The second tab allows you to manage your analysis sessions.</p>`,
                placement: 'centered',
                preAction: async () => {
                    const datasetTab = document.querySelector('ul[data-header="mainMenu"] > li:nth-child(2)');
                    if (!datasetTab.classList.contains('active')) {
                        datasetTab.querySelector('a').click();
                    }
                    // scroll to top
                    const selector = '#ordino_sessions_tab > .ordino-scrollspy-nav > a:nth-child(1)';
                    TourUtils.waitFor(selector);
                    TourUtils.click(selector);
                    await TourUtils.wait(600); // wait until the page scrolls to top
                },
            },
            {
                selector: '#ordino_sessions_tab > .ordino-scrollspy-container div[id^="targid_current_session"] > .card',
                html: `<p>You can save your current analysis session to continue it later or share it with colleagues, &hellip;</p>`,
                preAction: TourUtils.waitForSelector,
                placement: 'centered',
                postAction: () => TourUtils.click('#ordino_sessions_tab > .ordino-scrollspy-nav > a:nth-child(2)'),
                pageBreak: 'manual',
            },
            {
                selector: '#ordino_sessions_tab > .ordino-scrollspy-container div[id^="targid_persistent_session"] > .card',
                html: `<p>&hellip; and you can load previously saved analysis sessions. This includes your analyses as well as analyses by other users that were shared with you.</p>`,
                placement: 'centered',
                // preAction: (ctx) => TourUtils.waitForSelector.call(ctx).then(() => TourUtils.wait(400)),
                preAction: () => TourUtils.waitFor('#ordino_sessions_tab > .ordino-scrollspy-container div[id^="targid_persistent_session"] > .card').then(() => TourUtils.wait(400)),
                postAction: () => TourUtils.click('#ordino_sessions_tab > .ordino-scrollspy-nav > a:nth-child(3)'),
                pageBreak: 'manual',
            },
            {
                selector: '#ordino_sessions_tab > .ordino-scrollspy-container div[id^="targid_temporary_session"] > .card',
                html: `<p>Furthermore, you have access to your 10 most recent analysis sessions, even if they were not saved, and &hellip;</p>`,
                placement: 'centered',
                preAction: () => TourUtils.waitFor('#ordino_sessions_tab > .ordino-scrollspy-container div[id^="targid_temporary_session"] > .card').then(() => TourUtils.wait(400)),
                postAction: () => TourUtils.click('#ordino_sessions_tab > .ordino-scrollspy-nav > a:nth-child(4)'),
                pageBreak: 'manual',
            },
            {
                selector: '#ordino_sessions_tab > .ordino-scrollspy-container div[id^="targid_import_session"] > .card',
                html: `<p>&hellip; you can import analysis sessions stored in a text file.</p>`,
                placement: 'centered',
                preAction: () => TourUtils.waitFor('#ordino_sessions_tab > .ordino-scrollspy-container div[id^="targid_import_session"] > .card').then(() => TourUtils.wait(400)),
                pageBreak: 'manual',
            },
            {
                selector: '#ordino_tours_tab  > .ordino-scrollspy-container >.container > div',
                html: `<p>Finally, the third tab contains all available help tours.</p>`,
                placement: 'centered',
                preAction: () => {
                    const datasetTab = document.querySelector('ul[data-header="mainMenu"] > li:nth-child(3)');
                    if (!datasetTab.classList.contains('active')) {
                        datasetTab.querySelector('a').click();
                    }
                    return TourUtils.waitFor('.ordino-dataset.genes-dataset').then(() => TourUtils.click('#ordino_dataset_tab > .ordino-scrollspy-nav > a:nth-child(3)'));
                },
            },
            {
                html: `<p>As the last step in this tour, we are interested in starting a
          new analysis session by loading a set of known cancer genes, called
          <i>'Cancer Gene Census'</i>. To do so, we are going back to the "Datasets" tab.</p>`,
                placement: 'centered',
                postAction: () => {
                    TourUtils.click('ul[data-header="mainMenu"] > li:nth-child(1) > a');
                },
            },
            {
                selector: '#ordino_dataset_tab .genes-dataset > .card',
                html: `<p>You can find the dataset of interest in the <i>'Genes'</i> section in the list of <i>'Predefined Sets'</i> &hellip;</p>`,
                pageBreak: 'manual',
                placement: 'centered',
                preAction: async () => {
                    await TourUtils.waitFor('#ordino_dataset_tab .genes-dataset > .card');
                    TourUtils.click('#ordino_dataset_tab > .ordino-scrollspy-nav > a:nth-child(3)');
                    await TourUtils.wait(700);
                },
                postAction: () => TourUtils.click('.ordino-dataset.genes-dataset .session-tab > li:first-child'),
            },
            {
                selector: '.ordino-dataset.genes-dataset .dataset-entry button[title^="Name: Cancer Gene Census"]',
                html: `<p>In this tour, we are interested in the already predefined set of known cancer genes, called <i>'Cancer Gene Census'</i>.</p>
        <p>It can be opened by clicking on it.</p>`,
                placement: 'centered',
                postAction: () => {
                    return TourUtils.waitFor('.ordino-dataset.genes-dataset .dataset-entry button[title^="Name: Cancer Gene Census"]').then(TourUtils.click);
                },
                pageBreak: 'manual',
            },
            {
                selector: '.le.le-multi.lineup-engine',
                placement: 'centered',
                html: `<p>Consequently, this opens the list of known cancer genes, including some basic information about them.</p>
        <p>Afterwards, you can now add additional columns and use other Ordino features to analyze these genes.</p>`,
                preAction: () => TourUtils.waitFor('.le.le-multi.lineup-engine', Infinity).then(() => TourUtils.wait(500)),
            },
            {
                html: `<p>Thanks for joining this tour demonstrating the start menu of Ordino.</p>
        <p>There are many more features to discover. Enjoy!</p>`,
            },
        ];
    }
}
//# sourceMappingURL=StartMenuTour.js.map