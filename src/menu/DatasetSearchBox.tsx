import React from 'react';
import {Button, Col, Row} from 'react-bootstrap';
import {RestBaseUtils, RestStorageUtils, StoreUtils} from 'tdp_core';
import {Species, SpeciesUtils} from 'tdp_gene';
import {FormatOptionLabelMeta} from 'react-select';
import {AsyncPaginate} from 'react-select-async-paginate';
import Highlighter from 'react-highlight-words';
import {I18nextManager, IDTypeManager, UserSession} from 'phovea_core';
import {OrdinoContext} from 'ordino';
import {IDataSourceConfig} from '../common';

interface IDatasetSearchBoxProps {
    placeholder: string;
    startViewId: string;
    dataSource: IDataSourceConfig;
}

export function DatasetSearchBox({placeholder, dataSource, startViewId}: IDatasetSearchBoxProps) {
    const [items, setItems] = React.useState<IdTextPair[]>(null);
    const {app} = React.useContext(OrdinoContext);

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

    // TODO: maybe this should be passed as props from the parent
    const startAnalyis = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault();
        const startViewOptions = {
            search: {
                ids: items?.map((i) => i.id),
                type: dataSource.tableName
            }
        };
        app.startNewSession(startViewId, startViewOptions, {[Species.SPECIES_SESSION_KEY]: SpeciesUtils.getSelectedSpecies()});
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
            // TODO: refresh NamedSetList component
            // this.push(response);
        });
    };

    return (
        <Row>
            <Col>
                <AsyncPaginate
                    placeholder={placeholder}
                    noOptionsMessage={() => 'No results found'}
                    isMulti={true}
                    loadOptions={loadOptions}
                    onChange={setItems}
                    formatOptionLabel={formatOptionLabel}
                    getOptionLabel={(option) => option.text}
                    getOptionValue={(option) => option.id}
                    captureMenuScroll={false}
                    additional={{
                        page: 1
                    }}
                />
            </Col>
            <Button variant="secondary" disabled={!items?.length} className="mr-2 pt-1 pb-1" onClick={startAnalyis}>Open</Button>
            <Button variant="outline-secondary" className="mr-2 pt-1 pb-1" disabled={!items?.length} onClick={saveAsNamedSet}>Save as set</Button>
        </Row>
    );
}
