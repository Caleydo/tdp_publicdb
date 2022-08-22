export declare class GeneIDTypeDetector {
    /**
     * Detect items from a data array starting `ENS` or `LRG`.
     * Returns a number between 0 and 1 defining the fraction of matching genes in the array.
     *
     * @param data Data array with objects or strings
     * @param accessor Accessor function to retrieve a certain field from a data item
     * @param sampleSize Number of samples to test; can be used to limit iterations for large arrays
     */
    static detectIDType(data: any[], accessor: (row: any) => string, sampleSize: number): number;
    static geneIDTypeDetector(): {
        detectIDType: typeof GeneIDTypeDetector.detectIDType;
    };
}
//# sourceMappingURL=GeneIDTypeDetector.d.ts.map