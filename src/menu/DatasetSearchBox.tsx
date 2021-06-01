import React from 'react';
import {RestBaseUtils, IdTextPair} from 'tdp_core';
import {FormatOptionLabelMeta} from 'react-select';
import {AsyncPaginate} from 'react-select-async-paginate';
import Highlighter from 'react-highlight-words';
import {IDataSourceConfig} from '../common';
import {IACommonListOptions} from 'tdp_gene';


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
}

export function DatasetSearchBox({placeholder, dataSource, onOpen, onSaveAsNamedSet, params = {}}: IDatasetSearchBoxProps) {
    const [items, setItems] = React.useState<IdTextPair[]>(null);

    const loadOptions = async (query: string, _, {page}: {page: number}) => {
        const {db, base, dbViewSuffix, entityName} = dataSource;

        return RestBaseUtils.getTDPLookup(db, base + dbViewSuffix, {
            column: entityName,
            ...params,
            query
        }).then(({items, more}) => ({
            options: items,
            hasMore: more,
            additional: {
                page: page + 1,
            }
        }));
    };

    const formatOptionLabel = (option: IdTextPair, ctx: FormatOptionLabelMeta<IdTextPair, true>) => {
        // do not highlight selected elements
        if (!ctx.inputValue || ctx.selectValue.some((o) => o.id === option.id)) {
            return option.text;
        }
        return (
            <Highlighter
                searchWords={[ctx.inputValue]}
                autoEscape={true}
                textToHighlight={option.text}
            />
        );
    };

    const searchResults = {
        search: {
            ids: items?.map((i) => i.id),
            type: dataSource.tableName
        }
    };

    return (
        <div className="row ordino-dataset-searchbox">
           <div className="col-sm-10">
                <AsyncPaginate
                    placeholder={placeholder}
                    noOptionsMessage={() => 'No results found'}
                    isMulti={true}
                    loadOptions={loadOptions}
                    value={items}
                    onChange={setItems}
                    formatOptionLabel={formatOptionLabel}
                    getOptionLabel={(option) => option.text}
                    getOptionValue={(option) => option.id}
                    captureMenuScroll={false}
                    additional={{
                        page: 1
                    }}
                />
            </div>
            <div className="col-sm-2">
                <button className="mr-2 pt-1 pb-1 btn btn-secondary" disabled={!items?.length} onClick={(event) => onOpen(event, searchResults)}>Open</button>
                <button className="mr-2 pt-1 pb-1 btn btn-outline-secondary" disabled={!items?.length} onClick={() => onSaveAsNamedSet(items)}>Save as set</button>
            </div>
        </div>
    );
}
