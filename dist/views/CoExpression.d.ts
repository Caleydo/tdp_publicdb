/**
 * Created by sam on 16.02.2017.
 */
import { IFormElementDesc } from 'tdp_core';
import { ACoExpression, ICoExprDataFormatRow, IGeneOption } from 'tdp_gene';
export declare class CoExpression extends ACoExpression {
    protected getParameterFormDescs(): IFormElementDesc[];
    private get dataSource();
    private get dataSubType();
    loadGeneList(ensgs: string[]): Promise<{
        id: string;
        symbol: string;
        _id: number;
    }[]>;
    loadData(ensg: string): Promise<ICoExprDataFormatRow[]>;
    loadFirstName(ensg: string): Promise<string>;
    protected getAttributeName(): string;
    get itemIDType(): import("tdp_core").IDType;
    protected select(range: string[]): void;
    protected getNoDataErrorMessage(refGene: IGeneOption): string;
}
//# sourceMappingURL=CoExpression.d.ts.map