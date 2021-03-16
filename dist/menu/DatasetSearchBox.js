import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { RestBaseUtils, RestStorageUtils, StoreUtils } from 'tdp_core';
import { Species, SpeciesUtils } from 'tdp_gene';
import { AsyncPaginate } from 'react-select-async-paginate';
import Highlighter from 'react-highlight-words';
import { I18nextManager, IDTypeManager, UserSession } from 'phovea_core';
import { GraphContext, SESSION_KEY_NEW_ENTRY_POINT } from 'ordino';
export function DatasetSearchBox({ placeholder, dataSource, startViewId }) {
    const [items, setItems] = React.useState(null);
    const { manager } = React.useContext(GraphContext);
    const loadOptions = async (query, _, { page }) => {
        const { db, base, dbViewSuffix, entityName } = dataSource;
        return RestBaseUtils.getTDPLookup(db, base + dbViewSuffix, {
            column: entityName,
            species: SpeciesUtils.getSelectedSpecies(),
            query
        }).then(({ items, more }) => ({
            options: items,
            hasMore: more,
            additional: {
                page: page + 1,
            }
        }));
    };
    const formatOptionLabel = (option, ctx) => {
        // do not highlight selected elements
        if (!ctx.inputValue || ctx.selectValue.some((o) => o.id === option.id)) {
            return option.text;
        }
        return (React.createElement(Highlighter, { searchWords: [ctx.inputValue], autoEscape: true, textToHighlight: option.text }));
    };
    // TODO: maybe this should be passed as props from the parent
    const startAnalyis = (event) => {
        event.preventDefault();
        const options = {
            search: {
                ids: items === null || items === void 0 ? void 0 : items.map((i) => i.id),
                type: dataSource.tableName
            }
        };
        UserSession.getInstance().store(SESSION_KEY_NEW_ENTRY_POINT, {
            view: startViewId,
            options,
            defaultSessionValues: { [Species.SPECIES_SESSION_KEY]: SpeciesUtils.getSelectedSpecies() }
        });
        manager.newGraph();
    };
    // TODO: maybe this should be passed as props from the parent
    const saveAsNamedSet = () => {
        StoreUtils.editDialog(null, I18nextManager.getInstance().i18n.t(`tdp:core.editDialog.listOfEntities.default`), async (name, description, isPublic) => {
            const idStrings = items === null || items === void 0 ? void 0 : items.map((i) => i.id);
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
    return (React.createElement(Row, null,
        React.createElement(Col, null,
            React.createElement(AsyncPaginate, { placeholder: placeholder, noOptionsMessage: () => 'No results found', isMulti: true, loadOptions: loadOptions, onChange: setItems, formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.text, getOptionValue: (option) => option.id, captureMenuScroll: false, additional: {
                    page: 1
                } })),
        React.createElement(Button, { variant: "secondary", disabled: !(items === null || items === void 0 ? void 0 : items.length), className: "mr-2 pt-1 pb-1", onClick: startAnalyis }, "Open"),
        React.createElement(Button, { variant: "outline-secondary", className: "mr-2 pt-1 pb-1", disabled: !(items === null || items === void 0 ? void 0 : items.length), onClick: saveAsNamedSet }, "Save as set")));
}
//# sourceMappingURL=DatasetSearchBox.js.map