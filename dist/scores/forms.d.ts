import { FormElementType } from 'tdp_core';
export declare const FORM_AGGREGATED_SCORE: ({
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
} | {
    type: FormElementType;
    label: string;
    id: string;
    dependsOn: string[];
    required: boolean;
    options: {
        optionsData: (selection: any) => {
            name: string;
            value: string;
            data: string;
        }[];
        type?: undefined;
        step?: undefined;
    };
    useSession: boolean;
    showIf?: undefined;
} | {
    type: FormElementType;
    label: string;
    id: string;
    dependsOn: string[];
    required: boolean;
    showIf: (dependantValues: any) => boolean;
    options: {
        optionsData: {
            name: string;
            value: string;
            data: string;
        }[];
        type?: undefined;
        step?: undefined;
    };
    useSession: boolean;
} | {
    type: FormElementType;
    label: string;
    id: string;
    required: boolean;
    dependsOn: string[];
    showIf: (dependantValues: any) => boolean;
    useSession: boolean;
    options: {
        type: string;
        step: string;
        optionsData?: undefined;
    };
} | {
    type: FormElementType;
    label: string;
    id: string;
    attributes: {
        style: string;
    };
    required: boolean;
    dependsOn: string[];
    showIf: (dependantValues: any) => boolean;
    useSession: boolean;
    options: {
        data: {
            text: string;
            id: string;
        }[];
    };
})[];
export declare const FORCE_COMPUTE_ALL_GENES: {
    label: string;
} & {
    type: FormElementType;
    id: string;
    options: {
        checked: number;
        unchecked: number;
    };
    useSession: boolean;
};
export declare const FORCE_COMPUTE_ALL_TISSUE: {
    label: string;
} & {
    type: FormElementType;
    id: string;
    options: {
        checked: number;
        unchecked: number;
    };
    useSession: boolean;
};
export declare const FORCE_COMPUTE_ALL_CELLLINE: {
    label: string;
} & {
    type: FormElementType;
    id: string;
    options: {
        checked: number;
        unchecked: number;
    };
    useSession: boolean;
};
export declare const FORM_SINGLE_SCORE: {
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
}[];
export declare const FORM_AGGREGATED_SCORE_DEPLETION: ({
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
} | {
    type: FormElementType;
    label: string;
    id: string;
    dependsOn: string[];
    required: boolean;
    options: {
        optionsData: (selection: any) => {
            name: string;
            value: string;
            data: string;
        }[];
        type?: undefined;
        step?: undefined;
    };
    useSession: boolean;
    showIf?: undefined;
} | {
    type: FormElementType;
    label: string;
    id: string;
    dependsOn: string[];
    required: boolean;
    showIf: (dependantValues: any) => boolean;
    options: {
        optionsData: {
            name: string;
            value: string;
            data: string;
        }[];
        type?: undefined;
        step?: undefined;
    };
    useSession: boolean;
} | {
    type: FormElementType;
    label: string;
    id: string;
    required: boolean;
    dependsOn: string[];
    showIf: (dependantValues: any) => boolean;
    useSession: boolean;
    options: {
        type: string;
        step: string;
        optionsData?: undefined;
    };
})[];
export declare const FORM_SINGLE_SCORE_DEPLETION: {
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
}[];
