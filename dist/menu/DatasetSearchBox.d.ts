import React from 'react';
import { IDataSourceConfig } from '../common';
import { IACommonListOptions } from 'tdp_gene';
interface IDatasetSearchBoxProps {
    placeholder: string;
    dataSource: IDataSourceConfig;
    onNamedSetsChanged: () => void;
    onOpen: (event: React.MouseEvent<HTMLElement>, search: Partial<IACommonListOptions>) => void;
}
export declare function DatasetSearchBox({ placeholder, dataSource, onOpen, onNamedSetsChanged }: IDatasetSearchBoxProps): JSX.Element;
export {};
