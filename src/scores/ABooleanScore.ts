import {IScore, IScoreRow} from 'tdp_core';
import {IDTypeManager} from 'tdp_core';
import {ColumnDescUtils} from 'tdp_core';
import {RestBaseUtils} from 'tdp_core';
import {IDataSourceConfig} from '../common/config';


export interface IBooleanScoreParams {
  [key: string]: any;
}

/**
 * score implementation in this case a numeric score is computed
 */
export abstract class ABooleanScore implements IScore<number> {

  /**
   * defines the IDType of which score values are returned. A score row is a pair of id and its score, e.g. {id: 'EGFR', score: 100}
   * @type {IDType}
   */
  get idType() {
    return IDTypeManager.getInstance().resolveIdType(this.dataSource.idType);
  }

  constructor(protected readonly params: IBooleanScoreParams, protected readonly dataSource: IDataSourceConfig) {}

  /**
   * creates the column description used within LineUp to create the oclumn
   * @returns {IAdditionalColumnDesc}
   */
  createDesc() {
    const label = this.label;
    return ColumnDescUtils.booleanCol(this.columnName, {label, width: 60});
  }

  /**
   * computes the actual scores and returns a Promise of IScoreRow rows
   * @returns {Promise<IScoreRow<number>[]>}
   */
  compute(): Promise<IScoreRow<number>[]> {
    return RestBaseUtils.getTDPScore(this.dataSource.db, `${this.dataSource.base}_${this.columnName}_score`, this.params);
  }

  protected abstract get label(): string;
  protected abstract get columnName(): string;
}
