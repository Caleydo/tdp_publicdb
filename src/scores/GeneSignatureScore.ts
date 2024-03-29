import { IPluginDesc } from 'visyn_core/plugin';
import { AppContext } from 'visyn_core/base';
import { IDTypeManager, IDType } from 'visyn_core/idtype';
import { I18nextManager } from 'visyn_core/i18n';
import { IScore, ColumnDescUtils, IScoreRow, RestBaseUtils, INamedSet, FormDialog, FormElementType } from 'tdp_core';
import { FieldUtils } from '../providers';
import { SpeciesUtils } from '../common';
import { ScoreUtils } from './ScoreUtils';
import { IDataSourceConfig, MAX_FILTER_SCORE_ROWS_BEFORE_ALL } from '../common/config';

/**
 * Interface describing the parameter needed for a `Gene Signature Score`.
 */
interface IGeneSignatureParam {
  signature: string;
}

/**
 * Data structure as returned from the query.
 */
interface IGeneSignature {
  id: string;
  description: string;
}

/**
 * `Gene Signature Score` options.
 */
interface IGeneSignatureOptions {
  description: string;
}

/**
 * Data returned from the Gene Signature Dialog.
 */
interface IGeneSignatureData {
  params: IGeneSignatureParam;
  options: IGeneSignatureOptions;
}

/**
 * Score implementation
 */
export class GeneSignatureScore implements IScore<number> {
  constructor(protected readonly params: IGeneSignatureParam, protected readonly dataSource: IDataSourceConfig, protected options?: IGeneSignatureOptions) {}

  /**
   * Defines the IDType of which score values are returned. A score row is a pair of id and its score, e.g. {id: 'EGFR', score: 100}
   * @type {IDType}
   */
  get idType() {
    return IDTypeManager.getInstance().resolveIdType(this.dataSource.idType);
  }

  /**
   * Creates the column description used within LineUp to create the oclumn
   * @returns {IAdditionalColumnDesc}
   */
  createDesc() {
    const label = this.options.description;
    return ColumnDescUtils.numberCol('_gene_signature', null, null, { label }); // null, null = infer min/max automatically from the data
  }

  /**
   * Computes the actual scores and returns a Promise of IScoreRow rows.
   * @returns {Promise<IScoreRow<number>[]>}
   */
  async compute(ids: string[], idtype: IDType, namedSet?: INamedSet): Promise<IScoreRow<number>[]> {
    const params = {
      signature: this.params.signature,
      species: SpeciesUtils.getSelectedSpecies(),
    };

    FieldUtils.limitScoreRows(params, ids, idtype, this.dataSource.entityName, MAX_FILTER_SCORE_ROWS_BEFORE_ALL, namedSet);
    return RestBaseUtils.getTDPScore(this.dataSource.db, `${this.dataSource.base}_gene_signature_score`, params);
  }

  static createGeneSignatureScore(data: IGeneSignatureData | IGeneSignatureData[], pluginDesc: IPluginDesc) {
    const { primary } = ScoreUtils.selectDataSources(pluginDesc);
    data = (Array.isArray(data) ? data : [data]) as IGeneSignatureData[];
    return data.map(({ params, options }) => new GeneSignatureScore(params, primary, options));
  }

  /**
   * Builder function for building the parameters of the score.
   * @returns {Promise<ISignatureColumnParam>} a promise for the parameter.
   */
  static async createGeneSignatureDialog(pluginDesc: IPluginDesc) {
    const dialog = new FormDialog(
      I18nextManager.getInstance().i18n.t('tdp:publicdb.addGeneSignature'),
      I18nextManager.getInstance().i18n.t('tdp:publicdb.add'),
    );
    const data = await AppContext.getInstance().getAPIJSON(`/tdp/db/publicdb/gene_signature`);
    const optionsData = data.map((item: IGeneSignature) => ({ text: `${item.id} (${item.description})`, id: item.id }));

    dialog.append({
      type: FormElementType.SELECT2_MULTIPLE,
      label: 'Signatures',
      id: 'signatures',
      attributes: {
        style: 'width:100%',
      },
      required: true,
      options: {
        data: optionsData,
      },
    });

    return dialog.showAsPromise((r) => {
      const signatures = r.getElementValues()?.signatures.map(({ id }) => {
        return {
          params: {
            signature: id,
          },
          options: {
            description: <string>data.find((item: IGeneSignature) => item.id === id).description,
          },
        };
      });
      return <IGeneSignatureData[]>signatures;
    });
  }
}
