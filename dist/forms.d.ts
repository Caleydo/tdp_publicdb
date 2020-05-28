/**
 * Created by sam on 06.03.2017.
 */
/// <reference types="select2" />
import { FormElementType } from 'tdp_core';
import { IDataSourceConfig } from './config';
import { format, formatGene, searchGene, validateGene } from './utils';
/**
 * List of ids for parameter form elements
 * Reuse this ids and activate the `useSession` option for form elements to have the same selectedIndex between different views
 */
export declare class ParameterFormIds {
    static DATA_SOURCE: string;
    static GENE_SYMBOL: string;
    static CELLLINE_NAME: string;
    static TISSUE_NAME: string;
    static DATA_SUBTYPE: string;
    static DATA_HIERARCHICAL_SUBTYPE: string;
    static COPYNUMBER_SUBTYPE: string;
    static EXPRESSION_SUBTYPE: string;
    static AGGREGATION: string;
    static COMPARISON_OPERATOR: string;
    static COMPARISON_VALUE: string;
    static COMPARISON_CN: string;
    static SCORE_FORCE_DATASET_SIZE: string;
    static COLOR_CODING: string;
}
export declare const COMPARISON_OPERATORS: {
    name: string;
    value: string;
    data: string;
}[];
export declare const CATEGORICAL_AGGREGATION: {
    name: string;
    value: string;
    data: string;
}[];
export declare const NUMERIC_AGGREGATION: {
    name: string;
    value: string;
    data: string;
}[];
export declare const FORM_GENE_NAME: {
    type: FormElementType;
    label: string;
    id: string;
    attributes: {
        style: string;
    };
    required: boolean;
    options: {
        optionsData: any[];
        search: typeof searchGene;
        validate: typeof validateGene;
        format: typeof formatGene;
    };
    useSession: boolean;
};
export declare const FORM_TISSUE_NAME: {
    type: FormElementType;
    label: string;
    id: string;
    attributes: {
        style: string;
    };
    required: boolean;
    options: {
        optionsData: any[];
        search: (query: any, page: any, pageSize: any) => Promise<{
            more: boolean;
            items: Readonly<IdTextPair>[];
        }>;
        validate: (query: any) => Promise<Readonly<IdTextPair>[]>;
        format: typeof format;
        tokenSeparators: RegExp;
        defaultTokenSeparator: string;
    };
    useSession: boolean;
};
export declare const FORM_CELLLINE_NAME: {
    type: FormElementType;
    label: string;
    id: string;
    attributes: {
        style: string;
    };
    required: boolean;
    options: {
        optionsData: any[];
        search: (query: any, page: any, pageSize: any) => Promise<{
            more: boolean;
            items: Readonly<IdTextPair>[];
        }>;
        validate: (query: any) => Promise<Readonly<IdTextPair>[]>;
        format: typeof format;
        tokenSeparators: RegExp;
        defaultTokenSeparator: string;
    };
    useSession: boolean;
};
export declare const FORM_GENE_FILTER: {
    type: FormElementType;
    label: string;
    id: string;
    useSession: boolean;
    options: {
        sessionKeySuffix: string;
        defaultSelection: boolean;
        uniqueKeys: boolean;
        badgeProvider: any;
        entries: ({
            name: string;
            value: string;
            type: FormElementType;
            multiple: boolean;
            return: string;
            optionsData: () => Promise<string[]>;
            search?: undefined;
            validate?: undefined;
            format?: undefined;
        } | {
            name: string;
            value: string;
            type: FormElementType;
            multiple: boolean;
            return: string;
            optionsData: () => Promise<{
                name: string;
                value: string | number;
            }[]>;
            search?: undefined;
            validate?: undefined;
            format?: undefined;
        } | {
            name: string;
            value: string;
            type: FormElementType;
            multiple: boolean;
            optionsData: any;
            return?: undefined;
            search?: undefined;
            validate?: undefined;
            format?: undefined;
        } | {
            name: string;
            value: string;
            type: FormElementType;
            multiple: boolean;
            search: typeof searchGene;
            validate: typeof validateGene;
            format: typeof formatGene;
            return?: undefined;
            optionsData?: undefined;
        })[];
    };
};
export declare const FORM_DATA_SOURCE: {
    type: FormElementType;
    label: string;
    id: string;
    required: boolean;
    options: {
        optionsData: {
            name: string;
            value: string;
            data: IDataSourceConfig;
        }[];
    };
    useSession: boolean;
};
export declare const FORM_TISSUE_FILTER: {
    type: FormElementType;
    label: string;
    id: string;
    useSession: boolean;
    options: {
        sessionKeySuffix: string;
        badgeProvider: any;
        defaultSelection: boolean;
        uniqueKeys: boolean;
        entries: any[];
    };
};
export declare const FORM_CELLLINE_FILTER: {
    type: FormElementType;
    label: string;
    id: string;
    useSession: boolean;
    options: {
        sessionKeySuffix: string;
        badgeProvider: any;
        defaultSelection: boolean;
        uniqueKeys: boolean;
        entries: any[];
    };
};
export declare const FORM_TISSUE_OR_CELLLINE_FILTER: {
    type: FormElementType;
    label: string;
    id: string;
    useSession: boolean;
    dependsOn: string[];
    options: any;
};
export declare const FORM_COLOR_CODING: {
    type: FormElementType;
    label: string;
    id: string;
    dependsOn: string[];
    options: {
        optionsData: (depends: any) => {
            name: string;
            value: string;
            data: any;
        }[];
    };
    useSession: boolean;
};
export declare const FORM_DATA_HIERARCHICAL_SUBTYPE: {
    type: FormElementType;
    label: string;
    id: string;
    attributes: {
        style: string;
    };
    required: boolean;
    options: {
        data: {
            text: string;
            children: {
                id: string;
                text: string;
            }[];
        }[];
    };
    useSession: boolean;
};
export declare const FORM_DATA_HIERARCHICAL_SUBTYPE_AGGREGATED_SELECTION: {
    type: FormElementType;
    label: string;
    id: string;
    attributes: {
        style: string;
    };
    required: boolean;
    options: {
        data: {
            text: string;
            children: {
                id: string;
                text: string;
            }[];
        }[];
    };
    useSession: boolean;
};
export declare const FORM_DATA_HIERARCHICAL_SUBTYPE_DEPLETION: {
    type: FormElementType;
    label: string;
    id: string;
    attributes: {
        style: string;
    };
    required: boolean;
    options: {
        data: {
            id: string;
            text: string;
        }[];
    };
    useSession: boolean;
};
export declare const FORM_DATA_HIERARCHICAL_SUBTYPE_AGGREGATED_SELECTION_DEPLETION: {
    type: FormElementType;
    label: string;
    id: string;
    attributes: {
        style: string;
    };
    required: boolean;
    options: {
        data: {
            id: string;
            text: string;
        }[];
    };
    useSession: boolean;
};
