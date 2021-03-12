import { IDataSourceConfig } from 'tdp_publicdb';
interface IDatasetSearchBoxProps {
    placeholder: string;
    startViewId: string;
    datasource: IDataSourceConfig;
}
export declare function DatasetSearchBox({ placeholder, datasource, startViewId }: IDatasetSearchBoxProps): JSX.Element;
export {};
