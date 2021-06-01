import React from 'react';
import {RestBaseUtils, IdTextPair, Select3Utils} from 'tdp_core';
import {components, FormatOptionLabelMeta} from 'react-select';
import {AsyncPaginate} from 'react-select-async-paginate';
import Highlighter from 'react-highlight-words';
import {GeneUtils, IDataSourceConfig} from '../common';
import {IACommonListOptions} from 'tdp_gene';

interface IDatasetSearchOption {
    id: any;
    text: string;
    invalid?: boolean;
}

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

export function DatasetSearchBox({placeholder, dataSource, onOpen, onSaveAsNamedSet, params = {}, tokenSeparators = /[\s\n\r;,]+/gm}: IDatasetSearchBoxProps) {
    const [items, setItems] = React.useState<IDatasetSearchOption[]>([]);
    const [inputValue, setInputValue] = React.useState('');
    console.log(placeholder, tokenSeparators)
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

    const formatOptionLabel = (option: IDatasetSearchOption, ctx: FormatOptionLabelMeta<IDatasetSearchOption, true>) => {
        // do not highlight selected elements
        if (ctx.selectValue?.some((o) => o.id === option.id)) {
            return option.text;
        }
        return (
            <>
                <Highlighter
                    searchWords={[ctx.inputValue]}
                    autoEscape={true}
                    textToHighlight={option.text}
                />
                {option.text !== option.id &&
                    <span className="small text-muted ml-1">{option.id}</span>}
            </>
        );
    };

    const searchResults = {
        search: {
            ids: items?.filter((i) => !i.invalid)?.map((i) => i.id),
            type: dataSource.tableName
        }
    };

    React.useEffect(() => {
        setInputValue('');
    }, [items]);

    const onPaste = async (event: React.ClipboardEvent) => {
        const pastedData = event.clipboardData.getData('text')?.toLocaleLowerCase();
        const splitData = Select3Utils.splitEscaped(pastedData, tokenSeparators, false).map((d) => d.trim());
        const validData = await GeneUtils.validateGeneric(dataSource, splitData);

        const invalidData = splitData
            .filter((s) => !validData.length || validData.some((o) => o.id.toLocaleLowerCase() !== s && o.text.toLocaleLowerCase() !== s))
            .map((s) => ({id: s, text: s, invalid: true}));
        setItems([...validData, ...invalidData]);
    };

    return (
        <div className="row ordino-dataset-searchbox">
            <div className="col">
                <AsyncPaginate
                    onPaste={onPaste}
                    placeholder={placeholder}
                    noOptionsMessage={() => 'No results found'}
                    isMulti={true}
                    loadOptions={loadOptions}
                    inputValue={inputValue}
                    value={items}
                    onChange={setItems}
                    onInputChange={setInputValue}
                    formatOptionLabel={formatOptionLabel}
                    hideSelectedOptions
                    getOptionLabel={(option) => option.text}
                    getOptionValue={(option) => option.id}
                    captureMenuScroll={false}
                    additional={{
                        page: 1
                    }}
                    components={{Input}}
                    styles={{

                        multiValue: (styles, {data}) => ({
                            ...styles,
                            border: `1px solid #CCC`,
                            borderRadius: '3px'
                        }),
                        multiValueLabel: (styles, {data}) => ({
                            ...styles,
                            textDecoration: data.invalid ? 'line-through' : 'none',
                            color: data.color,
                            backgroundColor: 'white',
                            order: 2,
                            paddingLeft: '0',
                            paddingRight: '6px'
                        }),
                        multiValueRemove: (styles, {data}) => ({
                            ...styles,
                            color: data.invalid ? 'red' : '#999',
                            backgroundColor: 'white',
                            order: 1,
                            ':hover': {
                                color: '#333',
                                cursor: 'pointer'
                            },
                        }),

                        placeholder: (provided) => ({
                            ...provided,
                            // disable placeholder mouse events
                            pointerEvents: 'none',
                            userSelect: 'none',
                        }),
                        input: (css) => ({
                            ...css,
                            //expand the Input Component div
                            flex: '1 1 auto',
                            // expand the Input Component child div
                            '> div': {
                                width: '100%'
                            },
                            // expand the Input Component input
                            input: {
                                width: '100% !important',
                                textAlign: 'left'
                            }
                        })
                    }}
                />
            </div>
            <button className="mr-2 pt-1 pb-1 btn btn-secondary" disabled={!items?.length} onClick={(event) => onOpen(event, searchResults)}>Open</button>
            <button className="mr-2 pt-1 pb-1 btn btn-outline-secondary" disabled={!items?.length} onClick={() => onSaveAsNamedSet(items?.filter((i) => !i.invalid))}>Save as set</button>
        </div>
    );
}

// tslint:disable-next-line: variable-name
const Input = (props: any) => {
    const {onPaste} = props.selectProps;
    return <components.Input onPaste={onPaste} {...props} />;
};
