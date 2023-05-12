/**
 * Created by sam on 06.03.2017.
 */
import { AStartList, IAStartListOptions, ISelection, IViewContext, IParams } from 'tdp_core';
export interface ICommonDBConfig {
    idType: string;
    name: string;
    db: string;
    base: string;
    entityName: string;
    tableName: string;
}
export interface IACommonListOptions extends IAStartListOptions {
    search?: ISearchResult;
}
interface ISearchResult {
    ids: string[];
    type: string;
}
export declare abstract class ACommonList extends AStartList {
    protected readonly dataSource: ICommonDBConfig;
    private search;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataSource: ICommonDBConfig, options: Partial<IACommonListOptions>);
    protected loadColumnDesc(): Promise<Readonly<import("tdp_core").IDatabaseViewDesc>>;
    protected buildFilter(): IParams;
    protected loadRows(): Promise<import("visyn_core").IRow[]>;
    protected isValidFilter(key: string): boolean;
}
export {};
//# sourceMappingURL=ACommonList.d.ts.map