import {IStep} from 'tdp_core/src/extensions';
import {waitFor, wait} from 'tdp_core/src/tour/scripter';
import {setValueAndTrigger} from '../../../tdp_core/src/tour/scripter';

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
      placement: 'right',
      postAction: () => {
        document.querySelector<HTMLElement>('#entityType_gene-entry-point').click();
      }
    },

    {
      selector: '#entity_gene-entry-point .predefined-named-sets',
      html: `Of the available predefined gene sets, we open a list of known cancer genes, called 'Cancer Gene Census'`,
      placement: 'right',
      waitFor: () => waitFor('.does-not-exist', Infinity).then(() => <'next'>'next')
    },
    {
      selector: '.lineup-engine.lineup-multi-engine',
      placement: 'top',
      html: `The information is presented in a tabular format. Additionally to the gene ID, a set of columns containing some basic information is shown by default.`,
      preAction: () => waitFor('.lineup-engine.lineup-multi-engine', Infinity)
    },
    {
      selector: '.lu-side-panel button.fa-plus',
      html: `Additional columns can be added using the plus sign.`,
      placement: 'left',
      postAction: () => {
        document.querySelector<HTMLElement>('.lu-side-panel button.fa-plus').click();
      }
    },
    {
      selector: '.lu-search .lu-search-item',
      html: `First, we want to add a metadata column`,
      placement: 'left',
      preAction: () => wait(1000),
      postAction: () => {
        document.querySelector<HTMLElement>('.lu-search .lu-search-item').click();
      }
    },
    {
      selector: '.modal select[name=column]',
      html: `Here we select 'Strand' and click 'Add Column'`,
      placement: 'left',
      preAction: async () => {
        const elem = await waitFor('.modal select[name=column]');
        if (elem) {
          elem.focus();
        }
      },
      postAction: () => {
        const s = document.querySelector<HTMLSelectElement>('.modal select[name=column]');
        setValueAndTrigger(s, 'strand');
        s.closest('.modal').querySelector<HTMLElement>('.modal-footer button[type=submit]').click();
      }
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
      preAction: () => {
        document.querySelector<HTMLElement>('.lu-side-panel button.fa-plus').click();
      },
      postAction: () => {
        document.querySelector<HTMLElement>('.lu-search .lu-search-group .lu-search-item').click();
      }
    },
    {
      selector: 'div.modal:last-of-type',
      html: `Select the cell lines 'HCC-827' and 'BT-20'. As data type, choose 'Relative Copy Number'. Finally click 'Add Single Score Column'`,
      waitFor: () => waitFor('.lineup-engine header section[title^=BT]', Infinity).then(() => <'next'>'next')
    },
    {
      selector: '.lineup-engine header section[title^=BT], .lineup-engine header section[title^=HCC]',
      html: `The copy number information for each selected cell line has been added as additional columns`,
    },
    {
      selector: '.lineup-engine > header',
      html: `The column headers can be used to sort and filter the list of genes based on any of the available data`,
    },
    {
      selector: '.lineup-engine header section[title^=BT] i[title^=Sort]',
      html: `For example, you can use this icon to sort all genes by their copy number in the cell line 'HCC-827'`,
      waitFor: () => waitFor('.lu-row[data-meta=first][data-i="138"]', Infinity).then(() => <'next'>'next')
    },
    {
      selector: '.lu-row[data-meta=first]',
      html: `In order to obtain additional information about one or more genes, click on the respective line or use the checkboxes`,
      waitFor: () => waitFor('.viewWrapper .chooser:not(.hidden)', Infinity).then(() => <'next'>'next')
    },
    {
      selector: '.viewWrapper .chooser',
      html: `Various 'Detail Views', providing additional information, are available. For instance, clicking on 'Expression vs Copy Number' opens a scatter plot showing the relation of the two types of data.`,
    },
    {
      html: `<p>Thanks for joining this tour demonstrating the basic features of Ordino.</p>
      <p>There are many more features to discover. Enjoy!</p>`,
    },
  ];
}
