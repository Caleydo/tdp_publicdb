/**
 * Created by sam on 16.02.2017.
 */
import { IFormSelectDesc } from 'tdp_core/src/form';
import { AOncoPrint, IDataFormatRow, ISample } from 'tdp_gene/src/views/AOncoPrint';
export declare class OncoPrint extends AOncoPrint {
    protected getParameterFormDescs(): IFormSelectDesc[];
    private get dataSource();
    protected loadSampleList(): Promise<ISample[]>;
    protected getSampleIdType(): import("phovea_core/src/idtype").IDType;
    protected loadRows(ensg: string): Promise<IDataFormatRow[]>;
    protected loadFirstName(ensg: string): Promise<string>;
}
