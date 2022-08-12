export class GeneIDTypeDetector {
    /**
     * Detect items from a data array starting `ENS` or `LRG`.
     * Returns a number between 0 and 1 defining the fraction of matching genes in the array.
     *
     * @param data Data array with objects or strings
     * @param accessor Accessor function to retrieve a certain field from a data item
     * @param sampleSize Number of samples to test; can be used to limit iterations for large arrays
     */
    static detectIDType(data, accessor, sampleSize) {
        const testSize = Math.min(data.length, sampleSize);
        if (testSize <= 0) {
            return 0;
        }
        let foundIDTypes = 0;
        let validSize = 0;
        for (let i = 0; i < testSize; ++i) {
            const v = accessor(data[i]);
            if (v == null || typeof v !== 'string' || v.trim().length === 0) {
                continue; // skip empty samples
            }
            if (v.indexOf('ENS') === 0 || v.indexOf('LRG') === 0) {
                ++foundIDTypes;
            }
            ++validSize;
        }
        return foundIDTypes / validSize;
    }
    static geneIDTypeDetector() {
        return {
            detectIDType: GeneIDTypeDetector.detectIDType,
        };
    }
}
//# sourceMappingURL=GeneIDTypeDetector.js.map