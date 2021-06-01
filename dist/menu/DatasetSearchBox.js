import React from 'react';
import { RestBaseUtils } from 'tdp_core';
import { AsyncPaginate } from 'react-select-async-paginate';
import Highlighter from 'react-highlight-words';
export function DatasetSearchBox({ placeholder, dataSource, onOpen, onSaveAsNamedSet, params = {} }) {
    const [items, setItems] = React.useState(null);
    const loadOptions = async (query, _, { page }) => {
        const { db, base, dbViewSuffix, entityName } = dataSource;
        return RestBaseUtils.getTDPLookup(db, base + dbViewSuffix, {
            column: entityName,
            ...params,
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
    const searchResults = {
        search: {
            ids: items === null || items === void 0 ? void 0 : items.map((i) => i.id),
            type: dataSource.tableName
        }
    };
    return (React.createElement("div", { className: "row ordino-dataset-searchbox" },
        React.createElement("div", { className: "col-sm-10" },
            React.createElement(AsyncPaginate, { placeholder: placeholder, noOptionsMessage: () => 'No results found', isMulti: true, loadOptions: loadOptions, value: items, onChange: setItems, formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.text, getOptionValue: (option) => option.id, captureMenuScroll: false, additional: {
                    page: 1
                } })),
        React.createElement("div", { className: "col-sm-2" },
            React.createElement("button", { className: "mr-2 pt-1 pb-1 btn btn-secondary", disabled: !(items === null || items === void 0 ? void 0 : items.length), onClick: (event) => onOpen(event, searchResults) }, "Open"),
            React.createElement("button", { className: "mr-2 pt-1 pb-1 btn btn-outline-secondary", disabled: !(items === null || items === void 0 ? void 0 : items.length), onClick: () => onSaveAsNamedSet(items) }, "Save as set"))));
}
//# sourceMappingURL=DatasetSearchBox.js.map