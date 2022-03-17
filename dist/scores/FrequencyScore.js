/**
 * Created by sam on 06.03.2017.
 */
import { AFrequencyScore } from './AFrequencyScore';
export class FrequencyScore extends AFrequencyScore {
    getViewPrefix() {
        return '';
    }
}
export class FrequencyDepletionScore extends AFrequencyScore {
    getViewPrefix() {
        return 'depletion_';
    }
    createFilter() {
        return {
            depletionscreen: this.dataSubType.id === 'ceres' ? 'Avana' : 'Drive',
        };
    }
}
//# sourceMappingURL=FrequencyScore.js.map