/**
 * Created by sam on 16.02.2017.
 */
import { IFormElementDesc } from 'tdp_core';
import { ACoExpression, ICoExprDataFormatRow, IGeneOption } from 'tdp_gene';
import { Range } from 'phovea_core';
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
    get itemIDType(): import("phovea_core").IDType;
    protected select(range: Range): void;
    protected getNoDataErrorMessage(refGene: IGeneOption): string;
}
