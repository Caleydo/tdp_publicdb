/**
 * Created by sam on 16.02.2017.
 */

import {FormElementType, IFormSelectDesc} from 'tdp_core';
import {ACoExpression, ICoExprDataFormatRow, IGeneOption} from 'tdp_gene';
import {SpeciesUtils} from 'tdp_gene';
import {expression, IDataSourceConfig, IDataSubtypeConfig} from '../common/config';
import {ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER, FORM_DATA_SOURCE, FORM_COLOR_CODING} from '../common/forms';
import {loadGeneList, loadFirstName} from './utils';
import {IDTypeManager} from 'phovea_core';
import {Range} from 'phovea_core';
import {RestBaseUtils, IParams} from 'tdp_core';
import {LineupUtils} from 'tdp_core';


export class CoExpression extends ACoExpression {

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
    }, FORM_COLOR_CODING, FORM_TISSUE_OR_CELLLINE_FILTER);
    return base;
  }

  private get dataSource() {
    return <IDataSourceConfig>this.getParameterData(ParameterFormIds.DATA_SOURCE);
  }
  private get dataSubType() {
    return <IDataSubtypeConfig>this.getParameterData(ParameterFormIds.EXPRESSION_SUBTYPE);
  }

  loadGeneList(ensgs: string[]) {
    return loadGeneList(ensgs);
  }

  loadData(ensg: string): Promise<ICoExprDataFormatRow[]> {
    const ds = this.dataSource;

    const param: IParams = {
      ensg,
      attribute: this.dataSubType.id,
      species: SpeciesUtils.getSelectedSpecies()
    };
    const color = this.getParameterData(ParameterFormIds.COLOR_CODING);
    if (color) {
      param.color = color;
    }
    return RestBaseUtils.getTDPData(ds.db, `${ds.base}_co_expression${!color ? '_plain': ''}/filter`, RestBaseUtils.mergeParamAndFilters(param, LineupUtils.toFilter(this.getParameter('filter'))));
  }

  loadFirstName(ensg: string) {
    return loadFirstName(ensg);
  }

  protected getAttributeName() {
    return this.dataSubType.name;
  }

  get itemIDType() {
    return IDTypeManager.getInstance().resolveIdType(this.dataSource.idType);
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
