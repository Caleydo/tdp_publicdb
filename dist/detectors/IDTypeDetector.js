import { chooseDataSource } from '../common/config';
import { RestBaseUtils } from 'tdp_core';
async function detectIDType(data, accessor, sampleSize, options) {
    const testSize = Math.min(data.length, sampleSize);
    if (testSize <= 0) {
        return Promise.resolve(0);
    }
    let validSize = 0;
    const values = [];
    for (let i = 0; i < testSize; ++i) {
        const v = accessor(data[i]);
        if (v == null || v.trim().length === 0) {
            continue; //skip empty samples
        }
        values.push(v);
        ++validSize;
    }
    const ds = chooseDataSource(options);
    const result = await RestBaseUtils.getTDPData(ds.db, `${ds.base}_check_ids/filter`, {
        ['filter_' + ds.entityName]: values
    });
    return result[0].matches / validSize;
}
export function createIDTypeDetector() {
    return {
        detectIDType
    };
}
//# sourceMappingURL=IDTypeDetector.js.map