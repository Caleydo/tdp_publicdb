import {IStep} from 'tdp_core/src/extensions';
import {waitFor, wait, waitForSelector, setValueAndTrigger, clickSelector, click, keyDownEnter, toggleClass} from 'tdp_core/src/tour/scripter';

export function create(): IStep[] {
  return [
    {
      html: `Welcome to this short tour showing the basic features of Ordino`,
    },
    {
      selector: '.homeButton > a',
      html: `To start an analysis, click on the <i>'Home'</i> button. Subsequently, you can define the list of entities you want to work with`,
      placement: 'right-start',
      preAction: () => {
        if (document.querySelector('.startMenu.open')) {
          click('.startMenu .closeButton');
        }
      },
      postAction: clickSelector
    },

    {
      selector: '.startMenu.open .speciesSelector .nav-tabs',
      html: `<p>You can choose between the three entity types <i>'Cell Lines'</i>, <i>'Genes'</i>, and <i>'Tissues'</i>.</p> <p>In this example we will work with a list of genes</p>`,
      placement: 'right-start',
      postAction: () => click('#entityType_gene-entry-point')
    },

    {
      selector: '#entity_gene-entry-point .predefined-named-sets',
      html: `Of the available predefined gene sets, we open a list of known cancer genes, called <i>'Cancer Gene Census'</i>`,
      placement: 'right-start',
      postAction: () => {
        return waitFor('#entity_gene-entry-point .predefined-named-sets a[title^="Name: Cancer Gene Census"]').then(click);
      },
      pageBreak: 'manual'
    },
    {
      selector: '.lineup-engine.lineup-multi-engine',
      placement: 'top',
      html: `The information is presented in a tabular format. Additionally to the gene ID, a set of columns containing some basic information is shown by default.`,
      preAction: () => waitFor('.lineup-engine.lineup-multi-engine', Infinity).then(() => wait(500))
    },
    {
      selector: '.lu-side-panel button.fa-plus',
      html: `Additional columns can be added using the plus sign.`,
      placement: 'left',
      postAction: clickSelector
    },
    {
      selector: '.lu-search .lu-search-item',
      html: `First, we want to add a metadata column`,
      placement: 'left',
      postAction: () => {
        click('.lu-search .lu-search-item');
        toggleClass('.lu-adder.once', 'once', false);
      }
    },
    {
      selector: '.modal.in select[name=column]',
      html: `Here we select <i>'Strand'</i> &hellip;`,
      placement: 'right-start',
      preAction: waitForSelector,
      postAction: setValueAndTriggerSelector('strand')
    },
    {
      selector: '.modal.in .modal-footer button[type=submit]',
      html: `&hellip; and click <i>'Add Column'</i>`,
      placement: 'right-start',
      postAction: clickSelector
    },
    {
      selector: '.lineup-engine header section[title=Strand]',
      placement: 'right',
      html: `The strand information was added as a new column`,
      preAction: () => waitFor('.lineup-engine header section[title=Strand]').then(() => wait(250))
    },
    {
      selector: '.lu-search .lu-search-group .lu-search-item',
      placement: 'left',
      html: `Now, we want to add two columns containing the copy number information of two specific cell lines. To do so, we open the <i>'Cell Line Score'</i> dialog`,
      preAction: () => {
        click('.lu-side-panel button.fa-plus');
      },
      postAction: () => {
        click('.lu-search .lu-search-group .lu-search-item');
        toggleClass('.lu-adder.once', 'once', false);
      }
    },
    {
      selector: '.modal.in .form-group > .select3',
      placement: 'right-start',
      preAction: () => waitFor('.modal.in').then(() => wait(250)),
      html: `We select the cell lines <i>'HCC-827'</i> and <i>'BT-20'</i>.`,
      postAction: () => {
        setValueAndTrigger('.modal.in .select3 input.select2-search__field', 'HCC-827;BT-20;', 'input');
      }
    },
    {
      selector: '.modal.in .form-group > .select2',
      placement: 'right-start',
      html: `As data type, we choose <i>'Relative Copy Number'</i>`,
      postAction: () => {
        setValueAndTrigger('.form-group > .select2 input.select2-search__field', 'Relative Copy Number', 'input');
        keyDownEnter('.form-group > .select2 input.select2-search__field'); // since single selection to confirm the selection
      }
    },
    {
      selector: '.modal.in .modal-footer button[type=submit]',
      html: `Finally, click <i>'Add Single Score Column'</i>`,
      placement: 'right-start',
      postAction: clickSelector
    },
    {
      selector: ['.lineup-engine header section[title^=BT], .lineup-engine header section[title^=HCC]'],
      placement: 'right',
      preAction: () => waitFor('.lineup-engine header section[title^=BT]', 10000),
      html: `The copy number information for each selected cell line has been added as additional columns`,
    },
    {
      selector: '.lineup-engine > header',
      placement: 'top',
      html: `The column headers can be used to sort and filter the list of genes based on any of the available data`,
    },
    {
      selector: '.lineup-engine header section[title^=BT] i[title^=Sort]',
      placement: 'right',
      html: `For example, you can use this icon to sort all genes by their copy number in the cell line <i>'HCC-827'</i>`,
      postAction: clickSelector
    },
    {
      selector: '.lu-row[data-meta=first]',
      placement: 'bottom',
      html: `In order to obtain additional information about one or more genes, click on the respective line or use the checkboxes`,
      preAction: () => waitFor(() => {
        const r = document.querySelector<HTMLElement>('.lu-row[data-meta=first]');
        if (!r) {
          return null;
        }
        // has a string renderered EGFR entry
        if (!Array.from(r.querySelectorAll<HTMLElement>('div[data-renderer="string"]')).some((d) => d.textContent === 'EGFR')) {
          return null;
        }
        return r;
      }, Infinity),
      postAction: clickSelector
    },
    {
      selector: '.viewWrapper .chooser:not(.hidden)',
      placement: 'left-start',
      html: `Various 'Detail Views', providing additional information, are available.`,
      preAction: waitForSelector
    },
    {
      selector: '.viewWrapper .chooser button[data-viewid="celllinedb_expression_vs_copynumber"]',
      placement: 'left-start',
      html: `For instance, clicking on <i>'Expression vs Copy Number'</i> opens a scatter plot showing the relation of the two types of data`,
      postAction: clickSelector
    },
    {
      html: `<p>Thanks for joining this tour demonstrating the basic features of Ordino.</p>
      <p>There are many more features to discover. Enjoy!</p>`,
    },
  ];
}
