import { INamedSet, IDType } from 'tdp_core';
export declare class FieldUtils {
    /**
     * converts the field in the given array 2^<value>
     * @param rows
     * @param field
     * @returns {[any,any,any,any,any]}
     */
    static convertLog2ToLinear(rows: any[], field: string): any[];
    /**
     * limit the number of score rows if it doesn't exceed some criteria
     */
    static limitScoreRows(param: any, ids: string[], idTypeOfIDs: IDType, entity: string, maxDirectRows: number, namedSet?: INamedSet): void;
}
//# sourceMappingURL=FieldUtils.d.ts.map