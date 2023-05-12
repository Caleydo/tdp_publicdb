import React from 'react';
import { IdTextPair } from 'tdp_core';
import { IACommonListOptions } from '../views';
import { IDataSourceConfig } from '../common';
interface IDatasetSearchBoxParams {
    [key: string]: any;
}
interface IDatasetSearchBoxProps {
    placeholder: string;
    dataSource: IDataSourceConfig;
    onSaveAsNamedSet: (items: IdTextPair[]) => void;
    onOpen: (event: React.MouseEvent<HTMLElement>, search: Partial<IACommonListOptions>) => void;
    /**
     * Extra parameters when querying the options of the searchbox,
     */
    params?: IDatasetSearchBoxParams;
    tokenSeparators?: RegExp;
}
export declare function DatasetSearchBox({ placeholder, dataSource, onOpen, onSaveAsNamedSet, params, tokenSeparators }: IDatasetSearchBoxProps): React.JSX.Element;
export {};
//# sourceMappingURL=DatasetSearchBox.d.ts.map