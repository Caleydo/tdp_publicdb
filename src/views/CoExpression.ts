/**
 * Created by sam on 16.02.2017.
 */

import { IDTypeManager } from 'visyn_core';
import { FormElementType, IFormElementDesc, RestBaseUtils, IParams, LineupUtils } from 'tdp_core';
import { ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER, FORM_DATA_SOURCE, FORM_COLOR_CODING } from '../common/forms';
import { ViewUtils } from './ViewUtils';
import { expression, IDataSourceConfig, IDataSubtypeConfig } from '../common/config';
import { ACoExpression, ICoExprDataFormatRow, IGeneOption } from './ACoExpression';
import { SpeciesUtils } from '../common';

export class CoExpression extends ACoExpression {
  protected getParameterFormDescs(): IFormElementDesc[] {
    const base = super.getParameterFormDescs();
    base.splice(1, 0, FORM_DATA_SOURCE);
    base.push(
      {
        type: FormElementType.SELECT,
        label: 'Expression',
        id: ParameterFormIds.EXPRESSION_SUBTYPE,
        options: {
          optionsData: expression.dataSubtypes.map((ds) => {
            return { name: ds.name, value: ds.name, data: ds };
          }),
        },
        useSession: false,
      },
      FORM_COLOR_CODING,
      FORM_TISSUE_OR_CELLLINE_FILTER,
    );
    return base;
  }

  private get dataSource() {
    return <IDataSourceConfig>this.getParameterData(ParameterFormIds.DATA_SOURCE);
  }

  private get dataSubType() {
    return <IDataSubtypeConfig>this.getParameterData(ParameterFormIds.EXPRESSION_SUBTYPE);
  }

  loadGeneList(ensgs: string[]) {
    return ViewUtils.loadGeneList(ensgs);
  }

  loadData(ensg: string): Promise<ICoExprDataFormatRow[]> {
    const ds = this.dataSource;

    const param: IParams = {
      ensg,
      attribute: this.dataSubType.id,
      species: SpeciesUtils.getSelectedSpecies(),
    };
    const color = this.getParameterData(ParameterFormIds.COLOR_CODING);
    if (color) {
      param.color = color;
    }
    return RestBaseUtils.getTDPData(
      ds.db,
      `${ds.base}_co_expression${!color ? '_plain' : ''}/filter`,
      RestBaseUtils.mergeParamAndFilters(param, LineupUtils.toFilter(this.getParameter('filter'))),
    );
  }

  loadFirstName(ensg: string) {
    return ViewUtils.loadFirstName(ensg);
  }

  protected getAttributeName() {
    return this.dataSubType.name;
  }

  get itemIDType() {
    return IDTypeManager.getInstance().resolveIdType(this.dataSource.idType);
  }

  protected select(range: string[]): void {
    this.setItemSelection({
      idtype: this.itemIDType,
      ids: range,
    });
  }

  protected getNoDataErrorMessage(refGene: IGeneOption): string {
    const dataSource = this.dataSource.name;
    return `No data for the selected reference gene ${refGene.data.symbol} (${refGene.data.id}) and data source ${dataSource} available.`;
  }
}
