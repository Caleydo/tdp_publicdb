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
import Ordino from 'ordino/src/Ordino';
import * as $ from 'jquery';
import {setGlobalErrorTemplate} from 'ordino/src/Dialogs';

new Ordino({
  loginForm: String(loginForm)
});

setGlobalErrorTemplate((details) => `<div class="alert alert-warning" role="alert">An error has occurred. We are sorry about this. In case of questions, please contact <a
            href="mailto:thomas.zichner@boehringer-ingelheim.com">Thomas Zichner</a></div><hr><div style="max-width: 100%; overflow: auto">${details}</div>`);

// enable tooltips e.g. for login dialog
$('[data-toggle="popover"]').popover();
