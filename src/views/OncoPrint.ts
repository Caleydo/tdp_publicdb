/**
 * Created by sam on 16.02.2017.
 */

import { IDTypeManager } from 'visyn_core/idtype';
import { IFormElementDesc, RestBaseUtils, IParams, LineupUtils } from 'tdp_core';
import { ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER, FORM_DATA_SOURCE } from '../common/forms';
import { ViewUtils } from './ViewUtils';
import { IDataSourceConfig } from '../common/config';
import { AOncoPrint, IDataFormatRow, ISample } from './AOncoPrint';
import { SpeciesUtils } from '../common';

export class OncoPrint extends AOncoPrint {
  protected getParameterFormDescs(): IFormElementDesc[] {
    return [FORM_DATA_SOURCE, FORM_TISSUE_OR_CELLLINE_FILTER];
  }

  private get dataSource() {
    return <IDataSourceConfig>this.getParameterData(ParameterFormIds.DATA_SOURCE);
  }

  protected async loadSampleList(): Promise<ISample[]> {
    const ds = this.dataSource;
    const param: IParams = {
      species: SpeciesUtils.getSelectedSpecies(),
    };
    const rows = await RestBaseUtils.getTDPFilteredRows(ds.db, `${ds.base}_onco_print_sample_list`, param, LineupUtils.toFilter(this.getParameter('filter')));
    return rows.map((r) => ({ name: r.id, id: r._id }));
  }

  protected getSampleIdType() {
    const ds = this.dataSource;
    return IDTypeManager.getInstance().resolveIdType(ds.idType);
  }

  protected loadRows(ensg: string): Promise<IDataFormatRow[]> {
    const ds = this.dataSource;
    const param: IParams = {
      ensg,
      species: SpeciesUtils.getSelectedSpecies(),
    };
    return RestBaseUtils.getTDPData(
      ds.db,
      `${ds.base}_onco_print`,
      RestBaseUtils.mergeParamAndFilters(param, LineupUtils.toFilter(this.getParameter('filter'))),
    );
  }

  protected loadFirstName(ensg: string): Promise<string> {
    return ViewUtils.loadFirstName(ensg);
  }
}
