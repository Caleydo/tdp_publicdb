

import {ACommonList, IACommonListOptions} from 'tdp_gene/src/views/ACommonList';
import {ISelection, IViewContext} from 'tdp_core/src/views';
import {cellline} from '../config';
import {categoricalCol, stringCol} from 'tdp_core/src/lineup';
import {IServerColumn} from 'tdp_core/src/rest';

export default class CelllineList extends ACommonList {

  constructor(context:IViewContext, selection: ISelection, parent:HTMLElement, options: IACommonListOptions) {
    super(context, selection, parent, cellline, options);
  }

  protected getColumnDescs(columns: IServerColumn[]) {
    const findCat = (column: string) => columns.find((d) => d.column === column).categories;
    return [
      stringCol('id', {label: 'Name', width: 120}),
      //categoricalCol('species', desc.columns.species.categories, 'Species', true),
      categoricalCol('tumortype', findCat('tumortype'), {label: 'Tumor Type'}),
      categoricalCol('organ', findCat('organ'), {label: 'Organ'}),
      categoricalCol('gender', findCat('gender'), {label: 'Gender'}),
      categoricalCol('metastatic_site', findCat('metastatic_site'), {label: 'Metastatic Site', visible: false}),
      categoricalCol('histology_type', findCat('histology_type'), {label: 'Histology Type',  visible: false}),
      categoricalCol('morphology', findCat('morphology'), {label: 'Morphology',  visible: false}),
      categoricalCol('growth_type', findCat('growth_type'), {label: 'Growth Type',  visible: false}),
      categoricalCol('age_at_surgery', findCat('age_at_surgery'), {label: 'Age at Surgery',  visible: false}),
    ];
  }
}
