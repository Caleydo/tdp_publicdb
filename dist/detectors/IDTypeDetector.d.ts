interface IIDTypeDetectorOptions {
    sampleType: string;
}
export declare class IDTypeDetector {
    static detectIDType(data: any[], accessor: (row: any) => string, sampleSize: number, options: IIDTypeDetectorOptions): Promise<number>;
    static createIDTypeDetector(): {
        detectIDType: typeof IDTypeDetector.detectIDType;
    };
}
export {};
