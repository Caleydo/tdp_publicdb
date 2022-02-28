import { IRow, IAdditionalColumnDesc } from 'tdp_core';
export declare class LineUpStoredData {
    /**
     * Load the column description for a given idType
     *
     * @param idType idType
     * @returns {Promise<IAdditionalColumnDesc[]>} Returns a promise with a list of column descriptions
     */
    static loadEnsemblColumnDesc(idType: string): Promise<IAdditionalColumnDesc[]>;
    /**
     * Load rows for the given idType and the selected species, which is automatically retrieved from the session.
     * The list of rows can be filtered by a given list of ids.
     *
     * @param idType idType
     * @param ids List of ids for the given idType that are used as filter; if the list is empty all available rows are loaded
     * @returns {Promise<IRow[]>} Returns a promise with a list of data rows
     */
    static loadEnsemblRows(idType: string, ids: string[]): Promise<IRow[]>;
}
//# sourceMappingURL=LineUpStoredData.d.ts.map