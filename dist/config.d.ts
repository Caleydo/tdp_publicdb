export function chooseDataSource(desc: any): {
    idType: any;
    name: string;
    db: string;
    schema: string;
    tableName: string;
    entityName: string;
    base: string;
    columns: (find: any) => any[];
    columnInfo: {
        string: string[];
        number: any[];
        categorical: string[];
    };
};
/**
 * splits strings in the form of "DATA_TYPE-DATA_SUBTYPE" and returns the corresponding DATA_TYPE and DATA_SUBTYPE objects
 */
export function splitTypes(toSplit: any): {
    dataType: {
        id: string;
        name: string;
        tableName: string;
        query: string;
        dataSubtypes: {
            id: string;
            name: string;
            type: string;
            domain: number[];
            missingValue: number;
            constantDomain: boolean;
            useForAggregation: string;
        }[];
    } | {
        id: string;
        name: string;
        tableName: string;
        query: string;
        dataSubtypes: ({
            id: string;
            name: string;
            type: string;
            categories: any;
            missingCategory: any;
            useForAggregation: string;
            domain: number[];
            missingValue: number;
        } | {
            id: string;
            name: string;
            type: string;
            useForAggregation: string;
            domain: number[];
            missingValue: number;
            categories?: undefined;
            missingCategory?: undefined;
        })[];
    };
    dataSubType: any;
};
export function resolveDataTypes(dataTypeId: any, dataSubTypeId: any): {
    dataType: {
        id: string;
        name: string;
        tableName: string;
        query: string;
        dataSubtypes: {
            id: string;
            name: string;
            type: string;
            domain: number[];
            missingValue: number;
            constantDomain: boolean;
            useForAggregation: string;
        }[];
    } | {
        id: string;
        name: string;
        tableName: string;
        query: string;
        dataSubtypes: ({
            id: string;
            name: string;
            type: string;
            categories: any;
            missingCategory: any;
            useForAggregation: string;
            domain: number[];
            missingValue: number;
        } | {
            id: string;
            name: string;
            type: string;
            useForAggregation: string;
            domain: number[];
            missingValue: number;
            categories?: undefined;
            missingCategory?: undefined;
        })[];
    };
    dataSubType: any;
};
/**
 * maximal number of rows in which just the subset if fetched instead of all
 * @type {number}
 */
export var MAX_FILTER_SCORE_ROWS_BEFORE_ALL: number;
export namespace cellline {
    export const idType: string;
    export const name: string;
    export const db: string;
    export const schema: string;
    export const tableName: string;
    export const entityName: string;
    export const base: string;
    export function columns(find: any): any[];
    export const columnInfo: {
        string: string[];
        number: string[];
        categorical: string[];
    };
}
export namespace tissue {
    const idType_1: string;
    export { idType_1 as idType };
    const name_1: string;
    export { name_1 as name };
    const db_1: string;
    export { db_1 as db };
    const schema_1: string;
    export { schema_1 as schema };
    const tableName_1: string;
    export { tableName_1 as tableName };
    const entityName_1: string;
    export { entityName_1 as entityName };
    const base_1: string;
    export { base_1 as base };
    export function columns_1(find: any): any[];
    export { columns_1 as columns };
    const columnInfo_1: {
        string: string[];
        number: string[];
        categorical: string[];
    };
    export { columnInfo_1 as columnInfo };
}
export namespace gene {
    export { GENE_IDTYPE as idType };
    const name_2: string;
    export { name_2 as name };
    const db_2: string;
    export { db_2 as db };
    const schema_2: string;
    export { schema_2 as schema };
    const tableName_2: string;
    export { tableName_2 as tableName };
    const entityName_2: string;
    export { entityName_2 as entityName };
    const base_2: string;
    export { base_2 as base };
    export function columns_2(find: any): any[];
    export { columns_2 as columns };
    const columnInfo_2: {
        string: string[];
        number: any[];
        categorical: string[];
    };
    export { columnInfo_2 as columnInfo };
}
export var dataSources: {
    idType: string;
    name: string;
    db: string;
    schema: string;
    tableName: string;
    entityName: string;
    base: string;
    columns: (find: any) => any[];
    columnInfo: {
        string: string[];
        number: string[];
        categorical: string[];
    };
}[];
/**
 * list of possible types
 */
export var dataSubtypes: {
    number: string;
    string: string;
    cat: string;
    boxplot: string;
};
export namespace expression {
    export const id: string;
    const name_3: string;
    export { name_3 as name };
    const tableName_3: string;
    export { tableName_3 as tableName };
    export const query: string;
    export const dataSubtypes: {
        id: string;
        name: string;
        type: string;
        domain: number[];
        missingValue: number;
        constantDomain: boolean;
        useForAggregation: string;
    }[];
}
export namespace copyNumber {
    const id_1: string;
    export { id_1 as id };
    const name_4: string;
    export { name_4 as name };
    const tableName_4: string;
    export { tableName_4 as tableName };
    const query_1: string;
    export { query_1 as query };
    const dataSubtypes_1: ({
        id: string;
        name: string;
        type: string;
        domain: number[];
        missingValue: number;
        constantDomain: boolean;
        useForAggregation: string;
        categories?: undefined;
        missingCategory?: undefined;
    } | {
        id: string;
        name: string;
        type: string;
        categories: any;
        domain: number[];
        missingValue: number;
        missingCategory: any;
        useForAggregation: string;
        constantDomain?: undefined;
    })[];
    export { dataSubtypes_1 as dataSubtypes };
}
export namespace mutation {
    const id_2: string;
    export { id_2 as id };
    const name_5: string;
    export { name_5 as name };
    const tableName_5: string;
    export { tableName_5 as tableName };
    const query_2: string;
    export { query_2 as query };
    const dataSubtypes_2: ({
        id: string;
        name: string;
        type: string;
        categories: any;
        missingCategory: any;
        useForAggregation: string;
        domain: number[];
        missingValue: number;
    } | {
        id: string;
        name: string;
        type: string;
        useForAggregation: string;
        domain: number[];
        missingValue: number;
        categories?: undefined;
        missingCategory?: undefined;
    })[];
    export { dataSubtypes_2 as dataSubtypes };
}
export namespace depletion {
    const id_3: string;
    export { id_3 as id };
    const name_6: string;
    export { name_6 as name };
    const tableName_6: string;
    export { tableName_6 as tableName };
    const query_3: string;
    export { query_3 as query };
    const dataSubtypes_3: {
        id: string;
        name: string;
        type: string;
        domain: number[];
        missingValue: number;
        constantDomain: boolean;
        useForAggregation: string;
    }[];
    export { dataSubtypes_3 as dataSubtypes };
}
export var dataTypes: ({
    id: string;
    name: string;
    tableName: string;
    query: string;
    dataSubtypes: {
        id: string;
        name: string;
        type: string;
        domain: number[];
        missingValue: number;
        constantDomain: boolean;
        useForAggregation: string;
    }[];
} | {
    id: string;
    name: string;
    tableName: string;
    query: string;
    dataSubtypes: ({
        id: string;
        name: string;
        type: string;
        categories: any;
        missingCategory: any;
        useForAggregation: string;
        domain: number[];
        missingValue: number;
    } | {
        id: string;
        name: string;
        type: string;
        useForAggregation: string;
        domain: number[];
        missingValue: number;
        categories?: undefined;
        missingCategory?: undefined;
    })[];
})[];
