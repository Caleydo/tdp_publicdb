/**
 * Created by sam on 16.02.2017.
 */

import {FormElementType, IFormSelectDesc} from 'ordino/src/FormBuilder';
import {IViewContext, ISelection} from 'ordino/src/View';
import ACoExpression, {IDataFormatRow} from 'targid_common/src/views/ACoExpression';
import {getSelectedSpecies} from 'targid_common/src/Common';
import {dataSources, allTypes, expression} from '../config';
import {ParameterFormIds} from '../forms';
import {getAPIJSON} from 'phovea_core/src/ajax';
import {loadGeneList, loadFirstName} from './utils';

export class CoExpression extends ACoExpression {

  protected buildParameterDescs(): IFormSelectDesc[] {
    const base = super.buildParameterDescs();
    base.splice(1, 0, {
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
      label: 'Expression',
      id: ParameterFormIds.EXPRESSION_SUBTYPE,
      options: {
        optionsData: expression.dataSubtypes.map((ds) => {
          return {name: ds.name, value: ds.name, data: ds};
        })
      },
      useSession: false
    },{
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

  loadGeneList(ensgs: string[]) {
    return loadGeneList(ensgs);
  }

  loadData(ensg: string): Promise<IDataFormatRow[]> {
    const schema = this.getParameter(ParameterFormIds.DATA_SOURCE).schema;
    return getAPIJSON(`/targid/db/${this.getParameter(ParameterFormIds.DATA_SOURCE).db}/${schema}_co_expression${this.getParameter(ParameterFormIds.TUMOR_TYPE) === allTypes ? '_all' : ''}`, {
      ensg,
      expression_subtype: this.getParameter(ParameterFormIds.EXPRESSION_SUBTYPE).id,
      tumortype : this.getParameter(ParameterFormIds.TUMOR_TYPE),
      species: getSelectedSpecies()
    });
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
