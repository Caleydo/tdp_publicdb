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
                selector: '.homeButton > a',
                html: `<p>To open the start menu and to initiate an analysis, click on the <i>'Home'</i> button.</p>`,
                placement: 'centered',
                preAction: () => {
                    if (document.querySelector('.startMenu.open')) {
                        TourUtils.click('.startMenu .closeButton');
                    }
                },
                postAction: TourUtils.clickSelector
            },
            {
                selector: '.menu',
                html: `<p>The start menu allows you to load the data / entities that you want to analyze in Ordino (e.g., a set of cell lines).
        Furthermore, you can upload data and open previous analysis sessions.</p>
        <p>The menu is divided into four sections ...</p>`,
                placement: 'centered',
                preAction: () => TourUtils.waitFor('.menu').then(() => TourUtils.wait(1000)),
            },
            {
                selector: '.startMenu.open .speciesSelector',
                html: `<p>The first section is open by default and allows you select a set of genes, cell lines, and tissue samples to analyze ...</p>`,
                placement: 'centered',
                preAction: TourUtils.waitForSelector,
            },
            {
                selector: ['.startMenu.open .lineUpData', '.startMenu.open .tdpSessionTemporaryData', '.startMenu.open .tdpSessionPersistentData'],
                html: `<p>The other three sections are closed by default and can be opened by clicking on the section label.</p>`,
                placement: 'centered',
                preAction: TourUtils.waitForSelector,
                postAction: () => TourUtils.click('label[for="lineUpDataToggle"]')
            },
            {
                selector: '.startMenu.open .lineUpData',
                html: `<p>In this section you can upload tabular data in order to analyze it with Ordino.</p>`,
                placement: 'centered',
                preAction: () => TourUtils.waitFor('.startMenu.open .lineUpData').then(() => TourUtils.wait(250)),
                postAction: () => TourUtils.click('label[for="tdpSessionTemporaryDataToggle"]')
            },
            {
                selector: '.startMenu.open .tdpSessionTemporaryData',
                html: `<p>This section allows you to open your last 10 analyses even if they were not saved.</p>`,
                placement: 'centered',
                preAction: () => TourUtils.waitFor('.startMenu.open .tdpSessionTemporaryData').then(() => TourUtils.wait(250)),
                postAction: () => TourUtils.click('label[for="tdpSessionPersistentDataToggle"]')
            },
            {
                selector: '.startMenu.open .tdpSessionPersistentData',
                html: `<p>Finally, in this section you can load previously saved analysis sessions.
        This includes your analyses as well as analyses by other users that were shared with you.</p>`,
                placement: 'centered',
                preAction: () => TourUtils.waitFor('.startMenu.open .tdpSessionPersistentData').then(() => TourUtils.wait(250)),
                postAction: () => TourUtils.click('label[for="speciesSelectorToggle"]')
            },
            {
                selector: '.startMenu.open .speciesSelector',
                html: `<p>In this tour we are interested in loading a previously defined set of entities, so we open the first section again.</p>`,
                placement: 'centered',
                preAction: () => TourUtils.waitFor('.startMenu.open .speciesSelector').then(() => TourUtils.wait(250)),
            },
            {
                selector: '.startMenu.open .speciesSelector .nav-tabs',
                html: `<p>You can choose between the three entity types <i>'Cell Lines'</i>, <i>'Genes'</i>, and <i>'Tissue Samples'</i>.</p>
        <p>In this example we will work with a list of genes, so, we click on <i>Gene Sets</i>.</p>`,
                placement: 'centered',
                preAction: TourUtils.waitForSelector,
                postAction: () => TourUtils.click('#entityType_gene-entry-point')
            },
            {
                selector: '#entity_gene-entry-point .startMenuSearch',
                html: `<p>For each entity type you can either start with a manually defined set by adding ids (e.g., gene symbols or cell line names) into the search field, or ...</p>`,
                placement: 'centered',
                preAction: TourUtils.waitForSelector,
            },
            {
                selector: '#entity_gene-entry-point .named-sets-wrapper',
                html: `<p>... you can select an already defined set. There are three list: </p>
        <ul>
          <li><i>Predefined Sets</i> - These are already defined sets that are of general interest, including the set of all entities (e.g., the lists of all cell lines and all genes in our database).</li>
          <li><i>My Sets</i> - You can also define your own subsets of interesting/relevant genes, cell lines, etc. These will be listed here.</li>
          <li><i>Public Sets</i> - Entity subsets that other users created and shared with you show up in this list.</li>
        </ul>`,
                placement: 'centered',
                preAction: TourUtils.waitForSelector,
            },
            {
                selector: '#entity_gene-entry-point .predefined-named-sets a[title^="Name: Cancer Gene Census"]',
                html: `<p>In this tour, we are interested in the already predefined set of known cancer genes, called <i>'Cancer Gene Census'</i>.</p>
        <p>It can be opened by clicking on it.</p>`,
                placement: 'centered',
                postAction: () => {
                    return TourUtils.waitFor('#entity_gene-entry-point .predefined-named-sets a[title^="Name: Cancer Gene Census"]').then(TourUtils.click);
                },
                pageBreak: 'manual'
            },
            {
                selector: '.le.le-multi.lineup-engine',
                placement: 'centered',
                html: `<p>Consequently, this opens the list of known cancer genes, including some basic information about them.</p>
        <p>Afterwards, you can now add additional columns and use other Ordino features to analyze these genes.</p>`,
                preAction: () => TourUtils.waitFor('.le.le-multi.lineup-engine', Infinity).then(() => TourUtils.wait(500))
            },
            {
                html: `<p>Thanks for joining this tour demonstrating the start menu of Ordino.</p>
        <p>There are many more features to discover. Enjoy!</p>`,
            },
        ];
    }
}
//# sourceMappingURL=StartMenuTour.js.map