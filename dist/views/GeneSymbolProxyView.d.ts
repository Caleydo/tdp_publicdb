/**
 * Created by Holger Stitz on 06.12.2016.
 */
import { ProxyView } from 'tdp_core/src/views/ProxyView';
import { IFormSelectOption } from 'tdp_core/src/form';
/**
 * helper view for proxying an existing external website
 */
export declare class GeneSymbolProxyView extends ProxyView {
    protected getSelectionSelectData(ensgs: string[]): Promise<IFormSelectOption[]>;
}
