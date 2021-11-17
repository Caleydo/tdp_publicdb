/**
 * Created by Samuel Gratzl on 29.01.2016.
 */
import { ISelection, IViewContext } from 'tdp_core';
import { ARankingView, IAdditionalColumnDesc } from 'tdp_core';
import { LocalDataProvider } from 'lineupjs';
export declare class SimilarityView extends ARankingView {
    private loader;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement);
    protected getParameterFormDescs(): import("tdp_core").IFormElementDesc[];
    get itemIDType(): import("tdp_core").IDType;
    private updateOptionsData;
    static convertData(data: string): {
        [key: string]: any;
    }[];
    private loadImpl;
    private load;
    protected getColumnDescs(columns: any[]): IAdditionalColumnDesc[];
    protected loadColumnDesc(): Promise<any>;
    protected loadRows(): Promise<any>;
    protected parameterChanged(name: string): void;
    protected selectionChanged(): void;
    private updateImpl;
    protected createInitialRanking(provider: LocalDataProvider): void;
}
