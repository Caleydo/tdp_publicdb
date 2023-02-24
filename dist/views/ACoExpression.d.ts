/**
 * Created by Holger Stitz on 12.08.2016.
 */
import * as d3v3 from 'd3v3';
import { IFormSelectOption, AD3View, IFormElementDesc } from 'tdp_core';
export interface IGeneOption extends IFormSelectOption {
    data: {
        id: string;
        symbol: string;
        _id: number;
    };
}
export declare abstract class ACoExpression extends AD3View {
    private readonly margin;
    private readonly width;
    private readonly height;
    protected $errorMessage: d3v3.Selection<any>;
    protected $legend: d3v3.Selection<any>;
    private refGene;
    private refGeneExpression;
    private readonly x;
    private readonly y;
    private readonly color;
    private readonly xAxis;
    private readonly yAxis;
    protected initImpl(): Promise<void>;
    protected getParameterFormDescs(): IFormElementDesc[];
    parameterChanged(name: string): void;
    selectionChanged(): void;
    private updateRefGeneSelect;
    private loadRefGeneData;
    protected abstract loadData(ensg: string): Promise<ICoExprDataFormatRow[]>;
    protected abstract loadGeneList(ensgs: string[]): Promise<{
        id: string;
        symbol: string;
    }[]>;
    protected abstract loadFirstName(ensg: string): Promise<string>;
    private updateChart;
    private initChart;
    private resizeChart;
    private updateChartData;
    protected getNoDataErrorMessage(refGene: IGeneOption): string;
    protected abstract getAttributeName(): string;
    protected abstract select(r: string[]): void;
}
export interface ICoExprDataFormatRow {
    samplename: string;
    expression: number;
    color?: string;
    id: string;
}
export interface ICoExprDataFormat {
    id: string;
    geneName: string;
    rows: ICoExprDataFormatRow[];
}
//# sourceMappingURL=ACoExpression.d.ts.map