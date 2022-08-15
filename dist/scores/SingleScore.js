/**
 * Created by sam on 06.03.2017.
 */
import { ScoreUtils } from './ScoreUtils';
import { ASingleScore } from './ASingleScore';
function initializeScore(data, pluginDesc, singleScoreFactory) {
    const { primary, opposite } = ScoreUtils.selectDataSources(pluginDesc);
    const configs = data.data_types;
    function defineScore(name) {
        if (configs) {
            return configs.map((ds) => singleScoreFactory({ name, screen_type: data.screen_type, data_type: ds[0], data_subtype: ds[1], maxDirectFilterRows: data.maxDirectFilterRows }, primary, opposite));
        }
        return singleScoreFactory({ ...data, name }, primary, opposite);
    }
    if (Array.isArray(data.name)) {
        return [].concat(...data.name.map((name) => defineScore(name)));
    }
    return defineScore(data.name);
}
export class SingleScore extends ASingleScore {
    getViewPrefix() {
        return '';
    }
    static createScore(data, pluginDesc) {
        return initializeScore(data, pluginDesc, (parameter, dataSource, oppositeDataSource) => new SingleScore(parameter, dataSource, oppositeDataSource));
    }
}
export class SingleDepletionScore extends ASingleScore {
    getViewPrefix() {
        return 'depletion_';
    }
    createFilter() {
        return {
            depletionscreen: this.dataSubType.filter,
        };
    }
    static createSingleDepletionScore(data, pluginDesc) {
        return initializeScore(data, pluginDesc, (parameter, dataSource, oppositeDataSource) => new SingleDepletionScore(parameter, dataSource, oppositeDataSource));
    }
}
export class SingleDrugScore extends ASingleScore {
    constructor(parameter, dataSource, oppositeDataSource) {
        super(parameter, dataSource, oppositeDataSource);
        this.drugscreen = parameter.screen_type;
    }
    getViewPrefix() {
        return 'drug_';
    }
    createFilter() {
        return {
            campaign: this.drugscreen,
        };
    }
    static createSingleDrugScore(data, pluginDesc) {
        return initializeScore(data, pluginDesc, (parameter, dataSource, oppositeDataSource) => new SingleDrugScore(parameter, dataSource, oppositeDataSource));
    }
}
//# sourceMappingURL=SingleScore.js.map