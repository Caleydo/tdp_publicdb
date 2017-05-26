/**
 * Created by Samuel Gratzl on 16.12.2015
 */

// Determine the order of css files manually

import 'file-loader?name=index.html!extract-loader!html-loader!ordino/src/index.html';
import 'file-loader?name=404.html!ordino/src/404.html';
import 'file-loader?name=robots.txt!ordino/src/robots.txt';
import 'phovea_ui/src/_bootstrap';
import 'phovea_ui/src/_font-awesome';
import 'ordino/src/style.scss';
import * as loginForm from 'html-loader!./_loginForm.html';

import * as template from 'phovea_clue/src/template';
import * as header from 'phovea_ui/src/header';
import * as targid from 'ordino/src/Targid';
import * as $ from 'jquery';
import {setGlobalErrorTemplate} from 'ordino/src/Dialogs';

// cache the nodes from the ordino/index.html before the TargID app is created
// NOTE: the template (see next line) replaces the content of the document.body (but not document.head)
const appNode = document.getElementById('app');
const extrasNode = document.getElementById('extras');

// cache targid instance for logo app link
let targidInstance;

// create TargID app from CLUE template
const elems = template.create(document.body, {
  app: 'TargID 2',
  appLink: new header.AppHeaderLink('Target Discovery Platform', (event) => {
    event.preventDefault();
    targidInstance.openStartMenu();
    return false;
  }),
  application: 'TargID 2',
  id: 'targid2',
  recordSelectionTypes: null, // no automatic selection recording
  provVisCollapsed: true,
  thumbnails: false,
  headerOptions: {
    showReportBugLink: true
  },
  loginForm: String(loginForm)
});

const aboutDialogBody = elems.header.aboutDialog;
aboutDialogBody.insertAdjacentHTML('afterbegin', '<div class="alert alert-warning" role="alert"><strong>Disclaimer</strong> This software is <strong>for research purpose only</strong>.</span></div>');

setGlobalErrorTemplate((details) => `<div class="alert alert-warning" role="alert">An error has occurred. We are sorry about this. In case of questions, please contact <a
            href="mailto:thomas.zichner@boehringer-ingelheim.com">Thomas Zichner</a></div><hr><div style="max-width: 100%; overflow: auto">${details}</div>`);

// enable tooltips e.g. for login dialog
$('[data-toggle="popover"]').popover();


// copy nodes from original document to new document (template)
const mainNode = <HTMLElement>elems.$main.node();
mainNode.classList.add('targid');
while (appNode.firstChild) {
  mainNode.appendChild(appNode.firstChild);
}
while (extrasNode.firstChild) {
  document.body.appendChild(extrasNode.firstChild);
}

// create TargID app once the provenance graph is available
elems.graph.then((graph) => {
  targidInstance = targid.create(graph, elems.clueManager, mainNode, elems);
});
