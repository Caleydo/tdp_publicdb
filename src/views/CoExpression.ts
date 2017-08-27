/**
 * Created by sam on 16.02.2017.
 */

import {FormElementType, IFormSelectDesc, convertRow2MultiMap} from 'tdp_core/src/form';
import ACoExpression, {IDataFormatRow, IGeneOption} from 'tdp_gene/src/views/ACoExpression';
import {getSelectedSpecies} from 'tdp_gene/src/common';
import {expression, IDataSourceConfig} from '../config';
import {ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER, FORM_DATA_SOURCE} from '../forms';
import {loadGeneList, loadFirstName} from './utils';
import {toFilter} from 'tdp_gene/src/utils';
import {resolve} from 'phovea_core/src/idtype/manager';
import Range from 'phovea_core/src/range/Range';
import {getTDPData} from 'tdp_core/src/rest';


export default class CoExpression extends ACoExpression {

  protected getParameterFormDescs(): IFormSelectDesc[] {
    const base = super.getParameterFormDescs();
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

  private get dataSource() {
    return <IDataSourceConfig>this.getParameterData(ParameterFormIds.DATA_SOURCE);
  }

  loadGeneList(ensgs: string[]) {
    return loadGeneList(ensgs);
  }

  loadData(ensg: string): Promise<IDataFormatRow[]> {
    const ds = this.dataSource;
    const param: any = {
      ensg,
      attribute: this.getParameter(ParameterFormIds.EXPRESSION_SUBTYPE).id,
      species: getSelectedSpecies()
    };
    toFilter(param, convertRow2MultiMap(this.getParameter('filter')));
    return getTDPData(ds.db, `${ds.base}_co_expression/filter`, param);
  }

  loadFirstName(ensg: string) {
    return loadFirstName(ensg);
  }

  protected getAttributeName() {
    return this.getParameter(ParameterFormIds.EXPRESSION_SUBTYPE).name;
  }

  get itemIDType() {
    return resolve(this.dataSource.idType);
  }

  protected select(range: Range): void {
    this.setItemSelection({
      idtype: this.itemIDType,
      range
    });
  }

  protected getNoDataErrorMessage(refGene: IGeneOption): string {
    const dataSource = this.dataSource.name;
    return `No data for the selected reference gene ${refGene.data.symbol} (${refGene.data.id}) and data source ${dataSource} available.`;
  }
}
