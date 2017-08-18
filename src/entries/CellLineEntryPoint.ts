/**
 * Created by Holger Stitz on 10.08.2016.
 */

import {IPluginDesc} from 'phovea_core/src/plugin';
import {IEntryPointList, IEntryPointOptions} from 'ordino/src/StartMenu';
import {chooseDataSource} from '../config';
import {ACommonEntryPointList} from 'targid_common/src/entries/ACommonEntryPointList';
import {IACommonListOptions, ACommonList} from 'targid_common/src/entries/ACommonList';
import {IViewContext, ISelection} from 'ordino/src/View';
import {stringCol, categoricalCol, numberCol2} from 'ordino/src/LineUpView';
import SearchProvider from 'targid_common/src/entries/SearchProvider';


/**
 * Entry point list from all species and LineUp named sets (aka stored LineUp sessions)
 */
class CellLineEntryPointList extends ACommonEntryPointList {

  /**
   * Set the idType and the default data and build the list
   * @param parent
   * @param desc
   * @param options
   */
  constructor(parent: HTMLElement, desc: IPluginDesc, options:IEntryPointOptions) {
    super(parent, desc, chooseDataSource(desc), options);
  }
}

class CellLineList extends ACommonList {

  constructor(context:IViewContext, selection: ISelection, parent:Element, options: IACommonListOptions) {
    super(context, selection, parent, chooseDataSource(context.desc), options);
  }

  protected defineColumns(desc: any) {
    return [
      stringCol('id', 'Name', true, 120),
      //categoricalCol('species', desc.columns.species.categories, 'Species', true),
      categoricalCol('tumortype', desc.columns.tumortype.categories, 'Tumor Type', true),
      categoricalCol('organ', desc.columns.organ.categories, 'Organ', true),
      categoricalCol('gender', desc.columns.gender.categories, 'Gender', true),
      categoricalCol('metastatic_site', desc.columns.metastatic_site.categories, 'Metastatic Site', false),
      categoricalCol('histology_type', desc.columns.histology_type.categories, 'Histology Type', false),
      categoricalCol('morphology', desc.columns.morphology.categories, 'Morphology', false),
      categoricalCol('growth_type', desc.columns.growth_type.categories, 'Growth Type', false),
      categoricalCol('age_at_surgery', desc.columns.age_at_surgery.categories, 'Age at Surgery', false),
    ];
  }
}

class TissueList extends ACommonList {

  constructor(context:IViewContext, selection: ISelection, parent:Element, options: IACommonListOptions) {
    super(context, selection, parent, chooseDataSource(context.desc), options);
  }

  protected defineColumns(desc: any) {
    return [
      stringCol('id', 'Name', true, 120),
      //categoricalCol('species', desc.columns.species.categories, 'Species', true),
      categoricalCol('tumortype', desc.columns.tumortype.categories, 'Tumor Type', true),
      categoricalCol('organ', desc.columns.organ.categories, 'Organ', true),
      categoricalCol('gender', desc.columns.gender.categories, 'Gender', true),
      categoricalCol('tumortype_adjacent', desc.columns.tumortype_adjacent.categories, 'Tumor Type adjacent', false),
      categoricalCol('vendorname', desc.columns.vendorname.categories, 'Vendor name', false),
      categoricalCol('race', desc.columns.race.categories, 'Race', false),
      categoricalCol('ethnicity', desc.columns.ethnicity.categories, 'Ethnicity', false),
      numberCol2('age', desc.columns.age.min, desc.columns.age.max, 'Age', false),
      numberCol2('days_to_death', 0, desc.columns.days_to_death.max, 'Days to death', false),
      numberCol2('days_to_last_followup', 0, desc.columns.days_to_last_followup.max, 'Days to last follow up', false),
      categoricalCol('vital_status', desc.columns.vital_status.categories, 'Vital status', false),
      numberCol2('height', 0, desc.columns.height.max, 'Height', false),
      numberCol2('weight', 0, desc.columns.weight.max, 'Weight', false),
      numberCol2('bmi', 0, desc.columns.bmi.max, 'Body Mass Index (BMI)', false)
    ];
  }
}


/**
 * Create a list for main navigation from all species and LineUp named sets (aka stored LineUp sessions)
 * @param parent
 * @param desc
 * @param options
 * @returns {function(): any}
 */
export function createStartFactory(parent: HTMLElement, desc: IPluginDesc, options:IEntryPointOptions):IEntryPointList {
  return new CellLineEntryPointList(parent, desc, options);
}


export function createStart(context:IViewContext, selection: ISelection, parent:Element, options: IACommonListOptions) {
  return new CellLineList(context, selection, parent, options);
}

export function createStartTissue(context:IViewContext, selection: ISelection, parent:Element, options: IACommonListOptions) {
  return new TissueList(context, selection, parent, options);
}
