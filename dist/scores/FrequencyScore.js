/**
 * Created by sam on 06.03.2017.
 */
import { AFrequencyScore } from './AFrequencyScore';
export class FrequencyScore extends AFrequencyScore {
    constructor(parameter, dataSource, oppositeDataSource, countOnly) {
        super(parameter, dataSource, oppositeDataSource, countOnly);
    }
    getViewPrefix() {
        return '';
    }
}
export class FrequencyDepletionScore extends AFrequencyScore {
    constructor(parameter, dataSource, oppositeDataSource, countOnly) {
        super(parameter, dataSource, oppositeDataSource, countOnly);
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
//# sourceMappingURL=FrequencyScore.js.map