/**
 * Created by sam on 16.02.2017.
 */

import {IFormSelectDesc} from 'tdp_core';
import {AExpressionVsCopyNumber, ICopyNumberDataFormatRow} from 'tdp_gene';
import {SpeciesUtils} from 'tdp_gene';
import {Range} from 'phovea_core';
import {expression, copyNumber, IDataSourceConfig} from '../config';
import {ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER, FORM_DATA_SOURCE, FORM_COLOR_CODING} from '../forms';
import {IDTypeManager} from 'phovea_core';
import {loadFirstName} from './utils';
import {RestBaseUtils, IParams} from 'tdp_core';
import {LineUpUtils} from 'tdp_core';

export class ExpressionVsCopyNumber extends AExpressionVsCopyNumber {

  protected getParameterFormDescs(): IFormSelectDesc[] {
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
    return loadFirstName(ensg);
  }

  loadData(ensg: string): Promise<ICopyNumberDataFormatRow[]> {
    const ds = this.dataSource;
    const param: IParams = {
      ensg,
      expression_subtype: this.getParameterData(ParameterFormIds.EXPRESSION_SUBTYPE).id,
      copynumber_subtype: this.getParameterData(ParameterFormIds.COPYNUMBER_SUBTYPE).id,
      species: SpeciesUtils.getSelectedSpecies()
    };
    const color = this.getParameterData(ParameterFormIds.COLOR_CODING);
    if (color) {
      param.color = color;
    }
    return RestBaseUtils.getTDPData(ds.db, `${ds.base}_expression_vs_copynumber${!color ? '_plain': ''}/filter`, RestBaseUtils.mergeParamAndFilters(param, LineUpUtils.toFilter(this.getParameter('filter'))));
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

  get itemIDType() {
    return IDTypeManager.getInstance().resolveIdType(this.dataSource.idType);
  }

  protected select(range: Range) {
    this.setItemSelection({
      idtype: this.itemIDType,
      range
    });
  }
}
