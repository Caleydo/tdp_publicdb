/**
 * Created by Holger Stitz on 10.08.2016.
 */
import { ACommonSubSection } from 'tdp_gene';
import { IStartMenuSubSectionDesc } from 'tdp_gene';
import { IStartMenuSectionOptions } from 'ordino';
/**
 * Entry point list from all species and LineUp named sets (aka stored LineUp sessions)
 */
export declare class SampleSubSection extends ACommonSubSection {
    constructor(parent: HTMLElement, desc: IStartMenuSubSectionDesc, options: IStartMenuSectionOptions);
    protected searchOptions(): any;
}
