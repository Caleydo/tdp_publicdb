import { IFormElementDesc, AD3View } from 'tdp_core';
export declare abstract class AExpressionVsCopyNumber extends AD3View {
    private readonly margin;
    private readonly width;
    private readonly height;
    private $legend;
    private x;
    private y;
    private readonly color;
    private xAxis;
    private yAxis;
    protected initImpl(): void;
    protected abstract getExpressionValues(): {
        name: string;
        value: string;
        data: any;
    }[];
    protected abstract getCopyNumberValues(): {
        name: string;
        value: string;
        data: any;
    }[];
    protected getParameterFormDescs(): IFormElementDesc[];
    parameterChanged(name: string): void;
    selectionChanged(): void;
    /**
     * Filter expression values with 0, because log scale cannot handle log(0)
     * @param rows
     * @returns {any}
     */
    private filterZeroValues;
    private updateCharts;
    protected abstract loadData(ensg: string): Promise<ICopyNumberDataFormatRow[]>;
    protected abstract loadFirstName(ensg: string): Promise<string>;
    private initChart;
    private resizeChart;
    private updateChartData;
    protected abstract select(ids: string[]): void;
}
export interface ICopyNumberDataFormatRow {
    samplename: string;
    expression: number;
    color?: string;
    cn: number;
    id: string;
}
export interface ICopyNumberDataFormat {
    id: string;
    geneName: string;
    rows: ICopyNumberDataFormatRow[];
}
//# sourceMappingURL=AExpressionVsCopyNumber.d.ts.map