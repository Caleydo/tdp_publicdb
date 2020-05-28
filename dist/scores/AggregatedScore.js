/**
 * Created by sam on 06.03.2017.
 */
import { AAggregatedScore } from './AAggregatedScore';
export class AggregatedScore extends AAggregatedScore {
    constructor(parameter, dataSource, oppositeDataSource) {
        super(parameter, dataSource, oppositeDataSource);
    }
    getViewPrefix() {
        return '';
    }
}
export class AggregatedDepletionScore extends AAggregatedScore {
    constructor(parameter, dataSource, oppositeDataSource) {
        super(parameter, dataSource, oppositeDataSource);
    }
    getViewPrefix() {
        return 'depletion_';
    }
    createFilter() {
        return {
            depletionscreen: this.dataSubType.id === 'ceres' ? 'Avana' : 'Drive'
        };
    }
}
//# sourceMappingURL=AggregatedScore.js.map