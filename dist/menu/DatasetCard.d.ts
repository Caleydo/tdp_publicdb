import { IStartMenuDatasetDesc } from 'ordino';
import { IDataSourceConfig } from '../../dist';
interface IDatasetCardProps extends IStartMenuDatasetDesc {
    dataSource: IDataSourceConfig;
}
export default function DatasetCard({ name, headerIcon, tabs, viewId, dataSource }: IDatasetCardProps): JSX.Element;
export {};
