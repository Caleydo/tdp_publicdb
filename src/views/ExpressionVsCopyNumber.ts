/**
 * Created by sam on 16.02.2017.
 */

import {FormElementType, IFormSelectDesc} from 'ordino/src/FormBuilder';
import {IViewContext, ISelection} from 'ordino/src/View';
import AExpressionVsCopyNumber, {IDataFormatRow} from 'targid_common/src/views/AExpressionVsCopyNumber';
import {ParameterFormIds, dataSources, getSelectedSpecies, allTypes} from 'targid_common/src/Common';
import {getAPIJSON} from 'phovea_core/src/ajax';
import {loadFirstName} from './utils';

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
    base.push({
      type: FormElementType.SELECT,
      label: 'Tumor Type',
      id: ParameterFormIds.TUMOR_TYPE,
      dependsOn: [ParameterFormIds.DATA_SOURCE],
      options: {
        optionsFnc: (selection) => selection[0].data.tumorTypesWithAll,
        optionsData: []
      },
      useSession: true
    });
    return base;
  }

  loadFirstName(ensg: string) {
    return loadFirstName(ensg);
  }

  loadData(ensg: string): Promise<IDataFormatRow[]> {
    const schema = this.getParameter(ParameterFormIds.DATA_SOURCE).schema;
    return getAPIJSON(`/targid/db/${this.getParameter(ParameterFormIds.DATA_SOURCE).db}/${schema}_expression_vs_copynumber${this.getParameter(ParameterFormIds.TUMOR_TYPE) === allTypes ? '_all' : ''}`, {
      ensg,
      expression_subtype: this.getParameter(ParameterFormIds.EXPRESSION_SUBTYPE).id,
      copynumber_subtype: this.getParameter(ParameterFormIds.COPYNUMBER_SUBTYPE).id,
      tumortype: this.getParameter(ParameterFormIds.TUMOR_TYPE),
      species: getSelectedSpecies()
    });
  }
}


export function create(context: IViewContext, selection: ISelection, parent: Element, options?) {
  return new ExpressionVsCopyNumber(context, selection, parent, options);
}
