import { IDataSourceConfig } from '..';
interface IDatasetSearchBoxProps {
    placeholder: string;
    startViewId: string;
    dataSource: IDataSourceConfig;
    onNamedSetsChanged: () => void;
}
export declare function DatasetSearchBox({ placeholder, dataSource, startViewId, onNamedSetsChanged }: IDatasetSearchBoxProps): JSX.Element;
export {};
