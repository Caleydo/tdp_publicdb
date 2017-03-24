/**
 * Created by Samuel Gratzl on 27.04.2016.
 */

import * as dialogs from 'phovea_ui/src/dialogs';
import {IPluginDesc} from 'phovea_core/src/plugin';
import {
  ParameterFormIds, FORM_GENE_FILTER, FORM_TISSUE_FILTER, FORM_CELLLINE_FILTER
} from '../forms';
import {IScore} from 'ordino/src/LineUpView';
import {FormBuilder, IFormElementDesc} from 'ordino/src/FormBuilder';
import {select} from 'd3';
import AggregatedScore from './AggregatedScore';
import FrequencyScore from './FrequencyScore';
import {convertRow2MultiMap} from 'ordino/src/form/internal/FormMap';
import {FORM_AGGREGATED_SCORE} from './forms';
import {gene, tissue, cellline} from '../config';
import {selectDataSources} from './utils';


export function create(pluginDesc: IPluginDesc) {
  const {opposite} = selectDataSources(pluginDesc);
  // resolve promise when closing or submitting the modal dialog
  return new Promise((resolve) => {
    const dialog = dialogs.generateDialog('Add Aggregated Score Column', 'Add Aggregated Score Column');

    const form: FormBuilder = new FormBuilder(select(dialog.body));
    const formDesc: IFormElementDesc[] = FORM_AGGREGATED_SCORE.slice();
    switch(opposite) {
      case gene:
        formDesc.unshift(FORM_GENE_FILTER);
        break;
      case tissue:
        formDesc.unshift(FORM_TISSUE_FILTER);
        break;
      case cellline:
        formDesc.unshift(FORM_CELLLINE_FILTER);
        break;
    }

    form.build(formDesc);

    dialog.onSubmit(() => {
      const data = form.getElementData();
      data.filter = convertRow2MultiMap(data.filter);

      dialog.hide();
      resolve(data);
      return false;
    });

    dialog.onHide(() => {
      dialog.destroy();
    });

    dialog.show();
  });
}

export function createScore(data, pluginDesc: IPluginDesc): IScore<number> {
  const {primary, opposite} = selectDataSources(pluginDesc);
  const aggregation = data[ParameterFormIds.AGGREGATION];
  if (aggregation === 'frequency' || aggregation === 'count') {
    // boolean to indicate that the resulting score does not need to be divided by the total count
    const countOnly = aggregation === 'count';
    return new FrequencyScore(data, primary, opposite, countOnly);
  }
  return new AggregatedScore(data, primary, opposite);
}
