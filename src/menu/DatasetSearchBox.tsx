import React from 'react';
import {RestBaseUtils, RestStorageUtils, StoreUtils, IdTextPair} from 'tdp_core';
import {Species, SpeciesUtils} from 'tdp_gene';
import {FormatOptionLabelMeta} from 'react-select';
import {AsyncPaginate} from 'react-select-async-paginate';
import Highlighter from 'react-highlight-words';
import {I18nextManager, IDTypeManager} from 'phovea_core';
import {IDataSourceConfig} from '../common';
import {IACommonListOptions} from 'tdp_gene';

interface IDatasetSearchBoxProps {
    placeholder: string;
    dataSource: IDataSourceConfig;
    onNamedSetsChanged: () => void;
    onOpen: (event: React.MouseEvent<HTMLElement>, search: Partial<IACommonListOptions>) => void;
}

export function DatasetSearchBox({placeholder, dataSource, onOpen, onNamedSetsChanged}: IDatasetSearchBoxProps) {
    const [items, setItems] = React.useState<IdTextPair[]>(null);

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

    return (
        <div className="row">
            <div className="col">
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
            <button className="mr-2 pt-1 pb-1 btn btn-secondary" disabled={!items?.length} onClick={(event) => onOpen(event, searchResults)}>Open</button>
            <button className="mr-2 pt-1 pb-1 btn btn-outline-secondary" disabled={!items?.length} onClick={saveAsNamedSet}>Save as set</button>
        </div>
    );
}
