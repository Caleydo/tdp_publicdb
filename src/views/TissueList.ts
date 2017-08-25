

import {ACommonList, IACommonListOptions} from 'tdp_gene/src/views/ACommonList';
import {ISelection, IViewContext} from 'tdp_core/src/views';
import {tissue} from '../config';
import {categoricalCol, numberCol, stringCol} from 'tdp_core/src/lineup';
import {IServerColumn} from 'tdp_core/src/rest';

export default class TissueList extends ACommonList {

  constructor(context:IViewContext, selection: ISelection, parent:HTMLElement, options: IACommonListOptions) {
    super(context, selection, parent, tissue, options);
  }

  protected getColumnDescs(columns: IServerColumn[]) {
    const findCol = (column: string) => columns.find((d) => d.column === column);
    return [
      stringCol('id', {label: 'Name', width: 120}),
      //categoricalCol('species', desc.columns.species.categories, 'Species', true),
      categoricalCol('tumortype', findCol('tumortype').categories, {label: 'Tumor Type'}),
      categoricalCol('organ',findCol('organ').categories, {label: 'Organ'}),
      categoricalCol('gender', findCol('gender').categories, {label: 'Gender'}),
      categoricalCol('tumortype_adjacent', findCol('tumortype_adjacent').categories, {label: 'Tumor Type adjacent', visible: false}),
      categoricalCol('vendorname', findCol('vendorname').categories, {label: 'Vendor name', visible: false}),
      categoricalCol('race',findCol('race').categories, {label: 'Race', visible: false}),
      categoricalCol('ethnicity', findCol('ethnicity').categories, {label: 'Ethnicity',  visible: false}),
      numberCol('age', findCol('age').min, findCol('age').max, {label: 'Age',  visible: false}),
      numberCol('days_to_death', 0, findCol('days_to_death').max, {label: 'Days to death',  visible: false}),
      numberCol('days_to_last_followup', 0, findCol('days_to_last_followup').max, {label: 'Days to last follow up',  visible: false}),
      categoricalCol('vital_status', findCol('vital_status').categories, {label: 'Vital status',  visible: false}),
      numberCol('height', 0, findCol('height').max, {label: 'Height',  visible: false}),
      numberCol('weight', 0, findCol('weight').max, {label: 'Weight',  visible: false}),
      numberCol('bmi', 0, findCol('bmi').max, {label: 'Body Mass Index (BMI)',  visible: false})
    ];
  }
}
