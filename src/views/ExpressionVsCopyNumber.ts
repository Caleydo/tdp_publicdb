/**
 * Created by sam on 16.02.2017.
 */

import {IFormSelectDesc} from 'tdp_core/src/form';
import {AExpressionVsCopyNumber, ICopyNumberDataFormatRow} from 'tdp_gene/src/views/AExpressionVsCopyNumber';
import {getSelectedSpecies} from 'tdp_gene/src/common';
import Range from 'phovea_core/src/range/Range';
import {expression, copyNumber, IDataSourceConfig} from '../config';
import {ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER, FORM_DATA_SOURCE, FORM_COLOR_CODING} from '../forms';
import {resolve} from 'phovea_core/src/idtype';
import {loadFirstName} from './utils';
import {getTDPData, IParams, mergeParamAndFilters} from 'tdp_core/src/rest';
import {toFilter} from 'tdp_core/src/lineup';

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
      species: getSelectedSpecies()
    };
    const color = this.getParameterData(ParameterFormIds.COLOR_CODING);
    if (color) {
      param.color = color;
    }
    return getTDPData(ds.db, `${ds.base}_expression_vs_copynumber${!color ? '_plain': ''}/filter`, mergeParamAndFilters(param, toFilter(this.getParameter('filter'))));
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
    return resolve(this.dataSource.idType);
  }

  protected select(range: Range) {
    this.setItemSelection({
      idtype: this.itemIDType,
      range
    });
  }
}
