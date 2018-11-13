import {IStep} from 'tdp_core/src/extensions';
import {waitFor, wait, ensure} from 'tdp_core/src/tour/scripter';


function ensureLineUpOpen() {
  ensure(() => {
    const openSearchBox = !document.querySelector('.modal.in');
    const s = document.querySelector('.lu-search');
    s.classList.toggle('lu-search-open', openSearchBox);
    s.parentElement!.classList.toggle('once', openSearchBox);
    return openSearchBox;
  });
}

export function create(): IStep[] {
  return [{
      html: `Welcome to this short tour showing the basic features of Ordino`,
    },
    {
      selector: '.startMenu .closeButton',
      html: 'To start, click here to define the list of entities you want to work with',
      placement: 'right-start',
      waitFor: () => waitFor('.startMenu.open .speciesSelector .nav-tabs', Infinity).then(() => <'next'>'next'),
    },

    {
      selector: '.startMenu.open .speciesSelector .nav-tabs',
      html: `<p>You can choose between the three entity types <i>'Cell Lines'</i>, <i>'Genes'</i>, and <i>'Tissues'</i>.</p> <p>In this example we will work with a list of genes</p>`,
      placement: 'right-start',
      postAction: () => {
        document.querySelector<HTMLElement>('#entityType_gene-entry-point').click();
      }
    },

    {
      selector: '#entity_gene-entry-point .predefined-named-sets',
      html: `Of the available predefined gene sets, we open a list of known cancer genes, called <i>'Cancer Gene Census'</i>`,
      placement: 'right-start',
      pageBreak: true
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
      waitFor: () => waitFor('.lu-search-open', Infinity).then(() => <'next'>'next'),
      // postAction: () => {
      //   document.querySelector<HTMLElement>('.lu-side-panel button.fa-plus').click();
      // }
    },
    {
      selector: '.lu-search .lu-search-item',
      html: `First, we want to add a metadata column`,
      placement: 'left',
      preAction: ensureLineUpOpen,
      waitFor: () => waitFor('.modal.in select[name=column]', Infinity).then(() => <'next'>'next'),
      // postAction: () => {
      //   document.querySelector<HTMLElement>('.lu-search .lu-search-item').click();
      // }
    },
    {
      selector: '.modal.in .modal-content',
      html: `Here we select <i>'Strand'</i> and click <i>'Add Column'</i>`,
      placement: 'right-start',
      preAction: async () => {
        const elem = await waitFor('.modal.in select[name=column]');
        await wait(250);
        if (elem) {
          elem.focus();
        }
      },
      waitFor: () => waitFor('.lineup-engine header section[title=Strand]', Infinity).then(() => <'next'>'next'),
      // postAction: () => {
      //   const s = document.querySelector<HTMLSelectElement>('.modal select[name=column]');
      //   setValueAndTrigger(s, 'strand');
      //   s.closest('.modal').querySelector<HTMLElement>('.modal-footer button[type=submit]').click();
      // }
    },
    {
      selector: '.lineup-engine header section[title=Strand]',
      placement: 'right',
      html: `The strand information was added as a new column`,
    },
    {
      selector: '.lu-search .lu-search-group .lu-search-item',
      placement: 'left',
      html: `Now, we want to add a column containing the copy number information of two specific cell lines. To do so, click here`,
      preAction: ensureLineUpOpen,
      waitFor: () => waitFor('.modal.in', Infinity).then(() => <'next'>'next'),
      // postAction: () => {
      //   document.querySelector<HTMLElement>('.lu-search .lu-search-group .lu-search-item').click();
      // }
    },
    {
      selector: '.modal.in .modal-content',
      placement: 'right-start',
      preAction: () => waitFor('.modal.in', 10000).then(() => wait(250)),
      html: `Select the cell lines <i>'HCC-827'</i> and <i>'BT-20'</i>. As data type, choose <i>'Relative Copy Number'</i>. Finally click <i>'Add Single Score Column'</i>`,
      waitFor: () => waitFor('.lineup-engine header section[title^=BT]', Infinity).then(() => <'next'>'next')
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
      html: `For example, you can use this icon to sort all genes by their copy number in the cell line 'HCC-827'`,
      waitFor: () => waitFor(() => {
        const r = document.querySelector<HTMLElement>('.lu-row[data-meta=first]');
        if (!r) {
          return null;
        }
        // has a string renderered EGFR entry
        if (!Array.from(r.querySelectorAll<HTMLElement>('div[data-renderer="string"]')).some((d) => d.textContent === 'EGFR')) {
          return null;
        }
        return r;
      }, Infinity).then(() => <'next'>'next')
    },
    {
      selector: '.lu-row[data-meta=first]',
      placement: 'bottom',
      html: `In order to obtain additional information about one or more genes, click on the respective line or use the checkboxes`,
      waitFor: () => waitFor('.viewWrapper .chooser:not(.hidden)', Infinity).then(() => <'next'>'next')
    },
    {
      selector: '.viewWrapper .chooser',
      placement: 'left-start',
      html: `Various 'Detail Views', providing additional information, are available. For instance, clicking on 'Expression vs Copy Number' opens a scatter plot showing the relation of the two types of data.`,
    },
    {
      html: `<p>Thanks for joining this tour demonstrating the basic features of Ordino.</p>
      <p>There are many more features to discover. Enjoy!</p>`,
    },
  ];
}
