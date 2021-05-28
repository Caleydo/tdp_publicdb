import React from 'react';
import {RestBaseUtils, RestStorageUtils, StoreUtils, IdTextPair, Select3Utils} from 'tdp_core';
import {Species, SpeciesUtils} from 'tdp_gene';
import {components, FormatOptionLabelMeta} from 'react-select';
import {AsyncPaginate} from 'react-select-async-paginate';
import Highlighter from 'react-highlight-words';
import {I18nextManager, IDTypeManager} from 'phovea_core';
import {GeneUtils, IDataSourceConfig} from '../common';
import {IACommonListOptions} from 'tdp_gene';
import {merge} from 'lodash';

interface IDatasetSearchBoxProps {
    placeholder: string;
    dataSource: IDataSourceConfig;
    onNamedSetsChanged: () => void;
    onOpen: (event: React.MouseEvent<HTMLElement>, search: Partial<IACommonListOptions>) => void;
}

export function DatasetSearchBox({placeholder, dataSource, onOpen, onNamedSetsChanged}: IDatasetSearchBoxProps) {
    const [items, setItems] = React.useState<IdTextPair[]>([]);
    const [inputValue, setInputValue] = React.useState('');

    const loadOptions = async (query: string, _, {page}: {page: number}) => {
        const {db, base, dbViewSuffix, entityName} = dataSource;

        return RestBaseUtils.getTDPLookup(db, base + dbViewSuffix, {
            column: entityName,
            species: SpeciesUtils.getSelectedSpecies(),
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
            ids: items?.map((i) => i.id),
            type: dataSource.tableName
        }
    };

    // TODO: maybe this should be passed as props from the parent
    const saveAsNamedSet = () => {
        StoreUtils.editDialog(null, I18nextManager.getInstance().i18n.t(`tdp:core.editDialog.listOfEntities.default`), async (name, description, isPublic) => {
            const idStrings = items?.map((i) => i.id);
            const idType = IDTypeManager.getInstance().resolveIdType(dataSource.idType);
            const ids = await idType.map(idStrings);

            const response = await RestStorageUtils.saveNamedSet(name, idType, ids, {
                key: Species.SPECIES_SESSION_KEY,
                value: SpeciesUtils.getSelectedSpecies()
            }, description, isPublic);
            onNamedSetsChanged();
        });
    };

    React.useEffect(() => {
        setInputValue('');
    }, [items]);

    const onPaste = async (event: React.ClipboardEvent) => {
        const pastedData = event.clipboardData.getData('text')?.toLocaleLowerCase();

        const defaultTokenSeparator = /[\s\n\r;,]+/gm;
        const splitData = Select3Utils.splitEscaped(pastedData, defaultTokenSeparator, false);
        const items = await GeneUtils.validateGeneric(dataSource, splitData);
        setItems((previous) => {
            const newItems = merge(previous, items);
            return newItems;
        });
    };

    return (
        <div className="row">
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
                    getOptionLabel={(option) => option.text}
                    getOptionValue={(option) => option.id}
                    captureMenuScroll={false}
                    isOptionSelected={(option) => option.id === '1'}
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
                            color: data.color,
                            backgroundColor: 'white',
                            order: 2,
                            paddingLeft: '0',
                            paddingRight: '6px'
                        }),
                        multiValueRemove: (styles, {data}) => ({
                            ...styles,
                            color: '#999',
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
            <button className="mr-2 pt-1 pb-1 btn btn-outline-secondary" disabled={!items?.length} onClick={saveAsNamedSet}>Save as set</button>
        </div>
    );
}

// tslint:disable-next-line: variable-name
const Input = (props: any) => {
    const {onPaste} = props.selectProps;
    return <components.Input onPaste={onPaste} {...props} />;
};
