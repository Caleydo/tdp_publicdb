/**
 * Created by sam on 06.03.2017.
 */
import { resolveDataTypes } from '../common/config';
export class AScore {
    constructor(parameter) {
        const { dataType, dataSubType } = resolveDataTypes(parameter.data_type, parameter.data_subtype);
        this.dataType = dataType;
        this.dataSubType = dataSubType;
    }
}
//# sourceMappingURL=AScore.js.map