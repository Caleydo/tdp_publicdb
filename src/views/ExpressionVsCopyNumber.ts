import { IFormElementDesc } from 'tdp_core';
import { AExpressionVsCopyNumber, ICopyNumberDataFormatRow } from 'tdp_gene';
import { SpeciesUtils } from 'tdp_gene';
import { IDTypeManager } from 'tdp_core';
import { LineupUtils } from 'tdp_core';
import { RestBaseUtils, IParams } from 'tdp_core';
import { ViewUtils } from './ViewUtils';
import { ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER, FORM_DATA_SOURCE, FORM_COLOR_CODING } from '../common/forms';
import { expression, copyNumber, IDataSourceConfig } from '../common/config';

export class ExpressionVsCopyNumber extends AExpressionVsCopyNumber {
  protected getParameterFormDescs(): IFormElementDesc[] {
    const base = super.getParameterFormDescs();
    base.unshift(FORM_DATA_SOURCE);
    base.push(FORM_COLOR_CODING);
    base.push(FORM_TISSUE_OR_CELLLINE_FILTER);
    return base;
  }

  private get dataSource() {
    return <IDataSourceConfig>this.getParameterData(ParameterFormIds.DATA_SOURCE);
  }

  loadFirstName(ensg: string) {
    return ViewUtils.loadFirstName(ensg);
  }

  loadData(ensg: string): Promise<ICopyNumberDataFormatRow[]> {
    const ds = this.dataSource;
    const param: IParams = {
      ensg,
      expression_subtype: this.getParameterData(ParameterFormIds.EXPRESSION_SUBTYPE).id,
      copynumber_subtype: this.getParameterData(ParameterFormIds.COPYNUMBER_SUBTYPE).id,
      species: SpeciesUtils.getSelectedSpecies(),
    };
    const color = this.getParameterData(ParameterFormIds.COLOR_CODING);
    if (color) {
      param.color = color;
    }
    return RestBaseUtils.getTDPData(
      ds.db,
      `${ds.base}_expression_vs_copynumber${!color ? '_plain' : ''}/filter`,
      RestBaseUtils.mergeParamAndFilters(param, LineupUtils.toFilter(this.getParameter('filter'))),
    );
  }

  protected getExpressionValues() {
    return expression.dataSubtypes.map((ds) => {
      return { name: ds.name, value: ds.id, data: ds };
    });
  }

  protected getCopyNumberValues() {
    return copyNumber.dataSubtypes.map((ds) => {
      return { name: ds.name, value: ds.id, data: ds };
    });
  }

  get itemIDType() {
    return IDTypeManager.getInstance().resolveIdType(this.dataSource.idType);
  }

  protected select(ids: string[]) {
    this.setItemSelection({
      idtype: this.itemIDType,
      ids,
    });
  }
}
