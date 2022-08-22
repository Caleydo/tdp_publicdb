/**
 * Created by Holger Stitz on 07.12.2016.
 */
import { FormElementType } from 'tdp_core';
import { GeneProxyView } from './GeneProxyView';
/**
 * helper view for proxying an existing external website
 */
export declare class UniProtProxyView extends GeneProxyView {
    static SELECTED_UNIPROT_ITEM: string;
    static readonly OUTPUT_IDTYPE = "UniProt_human";
    protected initImpl(): Promise<void>;
    protected getParameterFormDescs(): {
        type: FormElementType;
        label: string;
        id: string;
        options: {
            optionsData: any[];
        };
        useSession: boolean;
    }[];
    protected parameterChanged(name: string): void;
    selectionChanged(): void;
    private updateUniProtSelect;
    private getUniProtSelectData;
    protected updateProxyView(): void;
}
//# sourceMappingURL=UniProtProxyView.d.ts.map