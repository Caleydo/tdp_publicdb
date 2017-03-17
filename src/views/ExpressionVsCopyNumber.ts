/**
 * Created by sam on 16.02.2017.
 */

import {FormElementType, IFormSelectDesc} from 'ordino/src/FormBuilder';
import {IViewContext, ISelection} from 'ordino/src/View';
import AExpressionVsCopyNumber, {IDataFormatRow} from 'targid_common/src/views/AExpressionVsCopyNumber';
import {getSelectedSpecies} from 'targid_common/src/Common';
import Range from 'phovea_core/src/range/Range';
import {dataSources, expression, copyNumber} from '../config';
import {ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER} from '../forms';
import {getAPIJSON} from 'phovea_core/src/ajax';
import {resolve} from 'phovea_core/src/idtype';
import {loadFirstName} from './utils';
import {convertRow2MultiMap} from 'ordino/src/form/internal/FormMap';
import {toFilter} from '../utils';

export class ExpressionVsCopyNumber extends AExpressionVsCopyNumber {

  protected buildParameterDescs(): IFormSelectDesc[] {
    const base = super.buildParameterDescs();
    base.unshift({
      type: FormElementType.SELECT,
      label: 'Data Source',
      id: ParameterFormIds.DATA_SOURCE,
      options: {
        optionsData: dataSources.map((ds) => {
          return {name: ds.name, value: ds.name, data: ds};
        })
      },
      useSession: true
    });
    base.push(FORM_TISSUE_OR_CELLLINE_FILTER);
    return base;
  }

  loadFirstName(ensg: string) {
    return loadFirstName(ensg);
  }

  loadData(ensg: string): Promise<IDataFormatRow[]> {
    const ds = this.getParameter(ParameterFormIds.DATA_SOURCE);
    const param: any = {
      ensg,
      expression_subtype: this.getParameter(ParameterFormIds.EXPRESSION_SUBTYPE).id,
      copynumber_subtype: this.getParameter(ParameterFormIds.COPYNUMBER_SUBTYPE).id,
      species: getSelectedSpecies()
    };
    toFilter(param, convertRow2MultiMap(this.getParameter('filter')));
    return getAPIJSON(`/targid/db/${ds.db}/${ds.base}_expression_vs_copynumber/filter`, param);
  }

  protected getExpressionValues() {
    return expression.dataSubtypes.map((ds) => {
      return {name: ds.name, value: ds.id, data: ds};
    });
  }

  protected getCopyNumberValues() {
    return copyNumber.dataSubtypes.map((ds) => {
      return {name: ds.name, value: ds.id, data: ds};
    });
  }

  protected select(range: Range) {
    this.setItemSelection({
      idtype: resolve(this.getParameter(ParameterFormIds.DATA_SOURCE).idType),
      range
    });
  }
}


export function create(context: IViewContext, selection: ISelection, parent: Element, options?) {
  return new ExpressionVsCopyNumber(context, selection, parent, options);
}
