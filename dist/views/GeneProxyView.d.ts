/**
 * Created by Holger Stitz on 06.12.2016.
 */
import { ProxyView, IFormSelectOption } from 'tdp_core';
/**
 * helper view for proxying an existing external website
 */
export declare class GeneProxyView extends ProxyView {
    protected getSelectionSelectData(ensgs: string[]): Promise<IFormSelectOption[]>;
    protected updateProxyView(): void;
}
//# sourceMappingURL=GeneProxyView.d.ts.map