/**
 * Created by sam on 16.02.2017.
 */

import {FormElementType, IFormSelectDesc} from 'ordino/src/FormBuilder';
import {IViewContext, ISelection} from 'ordino/src/View';
import ACoExpression, {IDataFormatRow} from 'targid_common/src/views/ACoExpression';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {expression} from '../config';
import {ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER, FORM_DATA_SOURCE} from '../forms';
import {getAPIJSON} from 'phovea_core/src/ajax';
import {loadGeneList, loadFirstName} from './utils';
import {convertRow2MultiMap} from 'ordino/src/form/internal/FormMap';
import {toFilter} from '../utils';

export class CoExpression extends ACoExpression {

  protected buildParameterDescs(): IFormSelectDesc[] {
    const base = super.buildParameterDescs();
    base.splice(1, 0, FORM_DATA_SOURCE);
    base.push({
      type: FormElementType.SELECT,
      label: 'Expression',
      id: ParameterFormIds.EXPRESSION_SUBTYPE,
      options: {
        optionsData: expression.dataSubtypes.map((ds) => {
          return {name: ds.name, value: ds.name, data: ds};
        })
      },
      useSession: false
    },FORM_TISSUE_OR_CELLLINE_FILTER);
    return base;
  }

  loadGeneList(ensgs: string[]) {
    return loadGeneList(ensgs);
  }

  loadData(ensg: string): Promise<IDataFormatRow[]> {
    const ds = this.getParameter(ParameterFormIds.DATA_SOURCE);
    const param: any = {
      ensg,
      attribute: this.getParameter(ParameterFormIds.EXPRESSION_SUBTYPE).id,
      species: getSelectedSpecies()
    };
    toFilter(param, convertRow2MultiMap(this.getParameter('filter')));
    return getAPIJSON(`/targid/db/${ds.db}/${ds.base}_co_expression/filter`, param);
  }

  loadFirstName(ensg: string) {
    return loadFirstName(ensg);
  }

  protected getAttributeName() {
    return this.getParameter(ParameterFormIds.EXPRESSION_SUBTYPE).name;
  }
}

export function create(context:IViewContext, selection: ISelection, parent:Element, options?) {
  return new CoExpression(context, selection, parent, options);
}
