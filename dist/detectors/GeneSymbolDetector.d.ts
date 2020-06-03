export declare class GeneSymbolDetector {
    static detectIDType(data: any[], accessor: (row: any) => string, sampleSize: number): Promise<number>;
    static human(): {
        GeneSymbolDetector: typeof GeneSymbolDetector;
        "": any;
    };
}
