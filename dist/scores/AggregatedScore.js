/**
 * Created by sam on 06.03.2017.
 */
import { AAggregatedScore } from './AAggregatedScore';
import { ScoreUtils } from './ScoreUtils';
import { ParameterFormIds } from '../common/forms';
import { FrequencyScore, FrequencyDepletionScore } from './FrequencyScore';
export class AggregatedScore extends AAggregatedScore {
    getViewPrefix() {
        return '';
    }
    static createAggregationFrequencyScore(data, pluginDesc) {
        return AggregatedScore.initializeAggregationFrequencyScore(data, pluginDesc, (d, primary, opposite) => new AggregatedScore(d, primary, opposite), (d, primary, opposite, countOnly) => new FrequencyScore(d, primary, opposite, countOnly));
    }
    static initializeAggregationFrequencyScore(data, pluginDesc, aggregatedScoreFactory, frequencyScoreFactory) {
        const { primary, opposite } = ScoreUtils.selectDataSources(pluginDesc);
        const aggregation = data[ParameterFormIds.AGGREGATION];
        if (aggregation === 'frequency' || aggregation === 'count') {
            // boolean to indicate that the resulting score does not need to be divided by the total count
            const countOnly = aggregation === 'count';
            return frequencyScoreFactory(data, primary, opposite, countOnly);
        }
        return aggregatedScoreFactory(data, primary, opposite);
    }
}
export class AggregatedDepletionScore extends AAggregatedScore {
    getViewPrefix() {
        return 'depletion_';
    }
    createFilter() {
        return {
            depletionscreen: this.dataSubType.id === 'ceres' ? 'Avana' : 'Drive',
        };
    }
    // Factories for depletion scores for DRIVE data
    static createAggregatedDepletionScore(data, pluginDesc) {
        return AggregatedScore.initializeAggregationFrequencyScore(data, pluginDesc, (d, primary, opposite) => new AggregatedDepletionScore(d, primary, opposite), (d, primary, opposite, countOnly) => new FrequencyDepletionScore(d, primary, opposite, countOnly));
    }
}
//# sourceMappingURL=AggregatedScore.js.map