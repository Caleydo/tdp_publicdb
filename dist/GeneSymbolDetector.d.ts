declare function detectIDType(data: any[], accessor: (row: any) => string, sampleSize: number): Promise<number>;
export declare function human(): {
    detectIDType: typeof detectIDType;
};
export {};
