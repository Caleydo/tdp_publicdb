import React from 'react';
import { RestBaseUtils, Select3Utils } from 'tdp_core';
import { components } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import Highlighter from 'react-highlight-words';
import { GeneUtils } from '../common';
export function DatasetSearchBox({ placeholder, dataSource, onOpen, onSaveAsNamedSet, params = {} }) {
    const [items, setItems] = React.useState([]);
    const [inputValue, setInputValue] = React.useState('');
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
        var _a;
        // do not highlight selected elements
        if ((_a = ctx.selectValue) === null || _a === void 0 ? void 0 : _a.some((o) => o.id === option.id)) {
            return option.text;
        }
        return (React.createElement(React.Fragment, null,
            React.createElement(Highlighter, { searchWords: [ctx.inputValue], autoEscape: true, textToHighlight: option.text }),
            option.text !== option.id &&
                React.createElement("span", { className: "small text-muted ml-1" }, option.id)));
    };
    const searchResults = {
        search: {
            ids: items === null || items === void 0 ? void 0 : items.map((i) => i.id),
            type: dataSource.tableName
        }
    };
    React.useEffect(() => {
        setInputValue('');
    }, [items]);
    const onPaste = async (event) => {
        var _a;
        const pastedData = (_a = event.clipboardData.getData('text')) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase();
        const defaultTokenSeparator = /[\s\n\r;,]+/gm;
        const splitData = Select3Utils.splitEscaped(pastedData, defaultTokenSeparator, false).map((d) => d.trim());
        const newItems = await GeneUtils.validateGeneric(dataSource, splitData);
        setItems(newItems);
    };
    return (React.createElement("div", { className: "row ordino-dataset-searchbox" },
        React.createElement("div", { className: "col" },
            React.createElement(AsyncPaginate, { onPaste: onPaste, placeholder: placeholder, noOptionsMessage: () => 'No results found', isMulti: true, loadOptions: loadOptions, inputValue: inputValue, value: items, onChange: setItems, onInputChange: setInputValue, formatOptionLabel: formatOptionLabel, hideSelectedOptions: true, getOptionLabel: (option) => option.text, getOptionValue: (option) => option.id, captureMenuScroll: false, additional: {
                    page: 1
                }, components: { Input }, styles: {
                    multiValue: (styles, { data }) => ({
                        ...styles,
                        border: `1px solid #CCC`,
                        borderRadius: '3px'
                    }),
                    multiValueLabel: (styles, { data }) => ({
                        ...styles,
                        color: data.color,
                        backgroundColor: 'white',
                        order: 2,
                        paddingLeft: '0',
                        paddingRight: '6px'
                    }),
                    multiValueRemove: (styles, { data }) => ({
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
                } })),
        React.createElement("button", { className: "mr-2 pt-1 pb-1 btn btn-secondary", disabled: !(items === null || items === void 0 ? void 0 : items.length), onClick: (event) => onOpen(event, searchResults) }, "Open"),
        React.createElement("button", { className: "mr-2 pt-1 pb-1 btn btn-outline-secondary", disabled: !(items === null || items === void 0 ? void 0 : items.length), onClick: () => onSaveAsNamedSet(items) }, "Save as set")));
}
// tslint:disable-next-line: variable-name
const Input = (props) => {
    const { onPaste } = props.selectProps;
    return React.createElement(components.Input, Object.assign({ onPaste: onPaste }, props));
};
//# sourceMappingURL=DatasetSearchBox.js.map