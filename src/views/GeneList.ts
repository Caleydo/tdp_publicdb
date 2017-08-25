

import {ACommonList, IACommonListOptions} from 'tdp_gene/src/views/ACommonList';
import {ISelection, IViewContext} from 'tdp_core/src/views';
import {gene} from '../config';
import {categoricalCol, stringCol} from 'tdp_core/src/lineup';
import {IServerColumn} from 'tdp_core/src/rest';

export default class GeneList extends ACommonList {

  constructor(context:IViewContext, selection: ISelection, parent:HTMLElement, options: IACommonListOptions) {
    super(context, selection, parent, gene, options);
  }

  protected getColumnDescs(columns: IServerColumn[]) {
    return [
      stringCol('symbol', {label: 'Symbol', width: 100}),
      stringCol('id', {label: 'Ensembl', width: 120}),
      stringCol('name', {label: 'Name'}),
      stringCol('chromosome', {label: 'Chromosome', width: 150}),
      categoricalCol('biotype', columns.find((d) => d.column === 'biotype').categories, {label: 'Biotype'}),
      categoricalCol('strand', [{ label: 'reverse strand', name:String(-1)}, { label: 'forward strand', name:String(1)}], {label: 'Strand', visible: false}),
      stringCol('seqregionstart', {label: 'Seq Region Start'}),
      stringCol('seqregionend', {label: 'Seq Region End'})
    ];
  }
}
