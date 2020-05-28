interface IIDTypeDetectorOptions {
    sampleType: string;
}
declare function detectIDType(data: any[], accessor: (row: any) => string, sampleSize: number, options: IIDTypeDetectorOptions): Promise<number>;
export declare function createIDTypeDetector(): {
    detectIDType: typeof detectIDType;
};
export {};
