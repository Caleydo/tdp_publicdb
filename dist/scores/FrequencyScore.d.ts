/**
 * Created by sam on 06.03.2017.
 */
import { IScore, IParams } from 'tdp_core';
import { AFrequencyScore } from './AFrequencyScore';
export declare class FrequencyScore extends AFrequencyScore implements IScore<number> {
    protected getViewPrefix(): string;
}
export declare class FrequencyDepletionScore extends AFrequencyScore implements IScore<number> {
    protected getViewPrefix(): string;
    protected createFilter(): IParams;
}
//# sourceMappingURL=FrequencyScore.d.ts.map