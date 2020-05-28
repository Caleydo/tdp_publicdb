/**
 * Created by sam on 16.02.2017.
 */


import {IFormSelectDesc} from 'tdp_core';
import {AOncoPrint, IDataFormatRow, ISample} from 'tdp_gene';
import {SpeciesUtils} from 'tdp_gene';
import {ParameterFormIds, FORM_TISSUE_OR_CELLLINE_FILTER, FORM_DATA_SOURCE} from '../common/forms';
import {loadFirstName} from './utils';
import {IDataSourceConfig} from '../common/config';
import {IDTypeManager} from 'phovea_core';
import {RestBaseUtils, IParams} from 'tdp_core';
import {LineUpUtils} from 'tdp_core';

export class OncoPrint extends AOncoPrint {


  protected getParameterFormDescs(): IFormSelectDesc[] {
    return [
      FORM_DATA_SOURCE,
      FORM_TISSUE_OR_CELLLINE_FILTER
    ];
  }


  private get dataSource() {
    return <IDataSourceConfig>this.getParameterData(ParameterFormIds.DATA_SOURCE);
  }

  protected async loadSampleList(): Promise<ISample[]> {
    const ds = this.dataSource;
    const param: IParams = {
      species: SpeciesUtils.getSelectedSpecies()
    };
    const rows = await RestBaseUtils.getTDPFilteredRows(ds.db, `${ds.base}_onco_print_sample_list`, param, LineUpUtils.toFilter(this.getParameter('filter')));
    return rows.map((r) => ({name: r.id, id: r._id}));
  }

  protected getSampleIdType() {
    const ds = this.dataSource;
    return IDTypeManager.getInstance().resolveIdType(ds.idType);
  }

  protected loadRows(ensg: string): Promise<IDataFormatRow[]> {
    const ds = this.dataSource;
    const param: IParams = {
      ensg,
      species: SpeciesUtils.getSelectedSpecies()
    };
    return RestBaseUtils.getTDPData(ds.db, `${ds.base}_onco_print`, RestBaseUtils.mergeParamAndFilters(param, LineUpUtils.toFilter(this.getParameter('filter'))));
  }

  protected loadFirstName(ensg: string): Promise<string> {
    return loadFirstName(ensg);
  }
}
