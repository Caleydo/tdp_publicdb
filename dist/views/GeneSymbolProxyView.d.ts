/**
 * Created by Holger Stitz on 06.12.2016.
 */
import { ProxyView } from 'tdp_core';
import { IFormSelectOption } from 'tdp_core';
/**
 * helper view for proxying an existing external website
 */
export declare class GeneSymbolProxyView extends ProxyView {
    protected getSelectionSelectData(ensgs: string[]): Promise<IFormSelectOption[]>;
}
