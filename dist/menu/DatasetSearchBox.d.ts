import { IDataSourceConfig } from 'tdp_publicdb';
interface IDatasetSearchBoxProps {
    placeholder: string;
    startViewId: string;
    dataSource: IDataSourceConfig;
}
export declare function DatasetSearchBox({ placeholder, dataSource, startViewId }: IDatasetSearchBoxProps): JSX.Element;
export {};
