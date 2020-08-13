/**
 * Created by Samuel Gratzl on 27.04.2016.
 */
import { IViewContext, ISelection } from 'tdp_core';
import { AD3View } from 'tdp_core';
import { IDataSourceConfig } from '../common/config';
export declare abstract class AInfoTable extends AD3View {
    private readonly dataSource;
    private readonly $table;
    private readonly $thead;
    private readonly $tbody;
    private data;
    private readonly fields;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, dataSource: IDataSourceConfig);
    protected initImpl(): Promise<void>;
    selectionChanged(): void;
    private fetchInformation;
    private update;
    /**
     * creates a 2D Array with the Gene symbols or Cell Line name as headers and the dbResults' properties as first column
     * @param dbResults Array of Objects
     * @param transposeTable
     * @returns string[][]
     */
    private transformData;
    private updateInfoTable;
    protected abstract getFields(): {
        key: string;
        order: number;
    }[];
}
export declare class CelllineInfoTable extends AInfoTable {
    constructor(context: any, selection: any, parent: any);
    protected getFields(): {
        key: string;
        order: number;
    }[];
}
export declare class GeneInfoTable extends AInfoTable {
    constructor(context: any, selection: any, parent: any);
    protected getFields(): {
        key: string;
        order: number;
    }[];
}
export declare class TissueInfoTable extends AInfoTable {
    constructor(context: any, selection: any, parent: any);
    protected getFields(): {
        key: string;
        order: number;
    }[];
}
