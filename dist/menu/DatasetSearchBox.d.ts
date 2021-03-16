import { IDataSourceConfig } from '..';
interface IDatasetSearchBoxProps {
    placeholder: string;
    startViewId: string;
    dataSource: IDataSourceConfig;
}
export declare function DatasetSearchBox({ placeholder, dataSource, startViewId }: IDatasetSearchBoxProps): JSX.Element;
export {};
