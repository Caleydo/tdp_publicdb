import {IStep} from 'tdp_core';
import {TourUtils} from 'tdp_core';


export class StartMenuTour {

  static createTour(): IStep[] {
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
        selector: 'ul[data-header="mainMenu"] > li:first-child > a',
        html: `<p>To open the start menu and to initiate an analysis, click on the <i>'Datasets'</i> button in the header.</p>`,
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
        selector: 'ul[data-header="mainMenu"]',
        html: `<p>The start menu allows you to load the data / entities that you want to analyze in Ordino (e.g., a set of cell lines).
        Furthermore, you can upload data and open previous analysis sessions.</p>
        <p>The menu contains three tabs &hellip;</p>`,
        placement: 'centered',
      },

      {
        selector: '#ordino_dataset_tab > .ordino-scrollspy-container .genes-dataset > .card',
        html: `<p>The first tab is open by default and allows you select a set of genes, &hellip;</p>`,
        placement: 'centered',
        preAction: TourUtils.waitForSelector,
        postAction: () => TourUtils.click('#ordino_dataset_tab > .ordino-scrollspy-nav > a:nth-child(2)'),
      },

      {
        selector: '#ordino_dataset_tab > .ordino-scrollspy-container .tissue-dataset > .card',
        html: `<p>&hellip; tissue samples, &hellip;</p>`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('#ordino_dataset_tab > .ordino-scrollspy-container .tissue-dataset > .card').then(() => TourUtils.wait(400)),
        postAction: () => TourUtils.click('#ordino_dataset_tab > .ordino-scrollspy-nav > a:nth-child(3)'),
        pageBreak: 'manual'
      },

      {
        selector: '#ordino_dataset_tab > .ordino-scrollspy-container .cellline-dataset > .card',
        html: `<p>&hellip; cell lines, &hellip;</p>`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('#ordino_dataset_tab > .ordino-scrollspy-container .cellline-dataset > .card').then(() => TourUtils.wait(400)),
        postAction: () => TourUtils.click('#ordino_dataset_tab > .ordino-scrollspy-nav > a:nth-child(4)'),
        pageBreak: 'manual'
      },

      {
        selector: '#ordino_dataset_tab > .ordino-scrollspy-container div[id^="tdp_uploaded_dataset"] > .card',
        html: `<p>&hellip;  or upload tabular data to analyze.</p>`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('#ordino_dataset_tab > .ordino-scrollspy-container div[id^="tdp_uploaded_dataset"] > .card').then(() => TourUtils.wait(400)),
        postAction: () => {
          TourUtils.click('ul[data-header="mainMenu"] > li:nth-child(2) > a');
        },
        pageBreak: 'manual'
      },


      {
        selector: '#ordino_sessions_tab > .ordino-scrollspy-container div[id^="targid_current_session"] > .card',
        html: `<p>In the next tab you can modify the currently open session, &hellip;</p>`,
        preAction: TourUtils.waitForSelector,
        placement: 'centered',
        postAction: () => TourUtils.click('#ordino_sessions_tab > .ordino-scrollspy-nav > a:nth-child(2)'),
        pageBreak: 'manual'
      },

      {
        selector: '#ordino_sessions_tab > .ordino-scrollspy-container div[id^="targid_persistent_session"] > .card',
        html: `<p>&hellip; load previously saved analysis sessions.
         This includes your analyses as well as analyses by other users that were shared with you, &hellip;</p>`,
        placement: 'centered',
        // preAction: (ctx) => TourUtils.waitForSelector.call(ctx).then(() => TourUtils.wait(400)),
        preAction: () => TourUtils.waitFor('#ordino_sessions_tab > .ordino-scrollspy-container div[id^="targid_persistent_session"] > .card').then(() => TourUtils.wait(400)),
        postAction: () => TourUtils.click('#ordino_sessions_tab > .ordino-scrollspy-nav > a:nth-child(3)'),
        pageBreak: 'manual'
      },

      {
        selector: '#ordino_sessions_tab > .ordino-scrollspy-container div[id^="targid_temporary_session"] > .card',
        html: `<p>&hellip; open your last 10 analyses even if they were not saved, &hellip;</p>`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('#ordino_sessions_tab > .ordino-scrollspy-container div[id^="targid_temporary_session"] > .card').then(() => TourUtils.wait(400)),
        postAction: () => TourUtils.click('#ordino_sessions_tab > .ordino-scrollspy-nav > a:nth-child(4)'),
        pageBreak: 'manual'
      },

      {
        selector: '#ordino_sessions_tab > .ordino-scrollspy-container div[id^="targid_import_session"] > .card',
        html: `<p>&hellip; or import a previously exported session.</p>`,
        placement: 'centered',
        preAction: () => TourUtils.waitFor('#ordino_sessions_tab > .ordino-scrollspy-container div[id^="targid_import_session"] > .card').then(() => TourUtils.wait(400)),
        postAction: () => TourUtils.click('ul[data-header="mainMenu"] > li:nth-child(3) > a'),
        pageBreak: 'manual'
      },

      {
        selector: '#ordino_tours_tab  > .ordino-scrollspy-container >.container > div',
        html: `<p>The last tab contains all the available tours.</p>`,
        placement: 'centered',
        postAction: () => {
          TourUtils.click('ul[data-header="mainMenu"] > li:nth-child(1) > a');
        },
      },

      {
        selector: '#ordino_dataset_tab .genes-dataset > .card',
        html: `<p>In this tour we are interested in loading a previously defined set of entities, so we open the first tab again.</p>
        <p>You can choose between the three entity types <i>'Cell Lines'</i>, <i>'Genes'</i>, and <i>'Tissue Samples'</i>.</p>
       <p>In this example we will work with a list of genes.</p>`,
        pageBreak: 'manual',
        placement: 'centered',
        preAction: async () => {
          await TourUtils.waitFor('#ordino_dataset_tab .genes-dataset > .card');
          TourUtils.click('#ordino_dataset_tab > .ordino-scrollspy-nav > a:first-child');
          await TourUtils.wait(700);
        },
        postAction: () => TourUtils.click('.ordino-dataset.genes-dataset session-tab > li:first-child')
      },

      {
        selector: '.ordino-dataset-searchbox > div:first-child',
        html: `<p>For each entity type you can either start with a manually defined set by adding ids (e.g., gene symbols or cell line names) into the search field, or &hellip;</p>`,
        placement: 'centered',
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
      },

      {
        selector: '.ordino-dataset.genes-dataset .dataset-entry button[title^="Name: Cancer Gene Census"]',
        html: `<p>In this tour, we are interested in the already predefined set of known cancer genes, called <i>'Cancer Gene Census'</i>.</p>
        <p>It can be opened by clicking on it.</p>`,
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
