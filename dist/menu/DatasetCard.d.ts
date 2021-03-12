import { IStartMenuDatasetSectionDesc } from 'ordino';
import { IDataSourceConfig } from '../../dist';
interface IDatasetCardProps extends IStartMenuDatasetSectionDesc {
    dataSource: IDataSourceConfig;
}
export default function DatasetCard({ name, headerIcon, tabs, viewId, dataSource }: IDatasetCardProps): JSX.Element;
export {};
