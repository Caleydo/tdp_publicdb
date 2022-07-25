import { FormElementType } from 'tdp_core';
export declare const FORM_AGGREGATED_SCORE: ({
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
    options: {
        placeholder: string;
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
    type: FormElementType;
    id: string;
    options: {
        checked: number;
        unchecked: number;
    };
    useSession: boolean;
    label: string;
};
export declare const FORCE_COMPUTE_ALL_TISSUE: {
    type: FormElementType;
    id: string;
    options: {
        checked: number;
        unchecked: number;
    };
    useSession: boolean;
    label: string;
};
export declare const FORCE_COMPUTE_ALL_CELLLINE: {
    type: FormElementType;
    id: string;
    options: {
        checked: number;
        unchecked: number;
    };
    useSession: boolean;
    label: string;
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
        placeholder: string;
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
    options: {
        placeholder: string;
        data: {
            id: string;
            text: string;
        }[];
    };
    useSession: boolean;
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
        placeholder: string;
        data: {
            id: string;
            text: string;
        }[];
    };
    useSession: boolean;
}[];
export declare const FORM_SINGLE_SCORE_DRUG: ({
    type: FormElementType;
    label: string;
    id: string;
    attributes: {
        style: string;
    };
    required: boolean;
    options: {
        placeholder: string;
        optionsData: any[];
        search: typeof import("..").GeneUtils.searchDrugScreen;
        validate: typeof import("..").GeneUtils.validateDrugScreen;
        format: typeof import("..").GeneUtils.formatDrugScreen;
    };
    useSession: boolean;
} | {
    type: FormElementType;
    label: string;
    id: string;
    attributes: {
        style: string;
    };
    required: boolean;
    options: {
        placeholder: string;
        data: {
            id: string;
            text: string;
        }[];
    };
    useSession: boolean;
})[];
//# sourceMappingURL=forms.d.ts.map