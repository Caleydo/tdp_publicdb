import { RestBaseUtils } from 'tdp_core';
import { chooseDataSource } from '../common/config';
export class IDTypeDetector {
    static async detectIDType(data, accessor, sampleSize, options) {
        const testSize = Math.min(data.length, sampleSize);
        if (testSize <= 0) {
            return Promise.resolve(0);
        }
        let validSize = 0;
        const values = [];
        for (let i = 0; i < testSize; ++i) {
            const v = accessor(data[i]);
            if (v == null || typeof v !== 'string' || v.trim().length === 0) {
                continue; // skip empty samples
            }
            values.push(v);
            ++validSize;
        }
        const ds = chooseDataSource(options);
        const result = await RestBaseUtils.getTDPData(ds.db, `${ds.base}_check_ids/filter`, {
            [`filter_${ds.entityName}`]: values,
        });
        return result[0].matches / validSize;
    }
    static createIDTypeDetector() {
        return {
            detectIDType: IDTypeDetector.detectIDType,
        };
    }
}
//# sourceMappingURL=IDTypeDetector.js.map