import React from 'react';
import { RestBaseUtils, Select3Utils } from 'tdp_core';
import { components } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import Highlighter from 'react-highlight-words';
import { GeneUtils } from '../common';
// functions to add data-testid attribute to react-select components
// eslint-disable-next-line
const addDataTestId = (Component, dataTestId) => 
// eslint-disable-next-line
(props) => (
// eslint-disable-next-line
React.createElement(Component, { ...props, 
    // eslint-disable-next-line
    innerProps: Object.assign({}, props.innerProps, { 'data-testid': `${dataTestId}${props.data ? '-' + props.data.id : ''}` }) }));
function Input(props) {
    const { onPaste } = props.selectProps;
    const modifiedProps = { 'data-testid': 'async-paginate-input', ...props };
    delete modifiedProps.popoverType; // remove the "illegal" prop from the copy
    return React.createElement(components.Input, { onPaste: onPaste, ...modifiedProps });
}
const clearIndicator = (props) => components.ClearIndicator && React.createElement(components.ClearIndicator, { ...props });
const dropdownIndicator = (props) => components.DropdownIndicator && React.createElement(components.DropdownIndicator, { ...props });
const option = (props) => components.Option && React.createElement(components.Option, { ...props });
const multiValueRemove = (props) => components.MultiValueRemove && React.createElement(components.MultiValueRemove, { ...props });
export function DatasetSearchBox({ placeholder, dataSource, onOpen, onSaveAsNamedSet, params = {}, tokenSeparators = /[\s;,]+/gm }) {
    const [items, setItems] = React.useState([]);
    const [inputValue, setInputValue] = React.useState('');
    const loadOptions = async (query, _, { page }) => {
        const { db, base, dbViewSuffix, entityName } = dataSource;
        return RestBaseUtils.getTDPLookup(db, base + dbViewSuffix, {
            column: entityName,
            ...params,
            query,
            page,
            limit: 10,
        }).then(({ items: elements, more }) => ({
            options: elements,
            hasMore: more,
            additional: {
                page: page + 1,
            },
        }));
    };
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const formatOptionLabel = (option, ctx) => {
        // do not highlight selected elements
        if (ctx.selectValue?.some((o) => o.id === option.id)) {
            return option.text;
        }
        return (React.createElement(React.Fragment, null,
            React.createElement(Highlighter, { searchWords: [ctx.inputValue], autoEscape: true, textToHighlight: option.text }),
            option.text !== option.id && React.createElement("span", { className: "small text-muted ms-1" }, option.id)));
    };
    React.useEffect(() => {
        setInputValue('');
    }, [items]);
    const onPaste = async (event) => {
        const pastedData = event.clipboardData.getData('text')?.toLocaleLowerCase();
        const splitData = Select3Utils.splitEscaped(pastedData, tokenSeparators, false)
            .map((d) => d.trim())
            .filter((d) => d !== '');
        const validData = await GeneUtils.validateGeneric(dataSource, splitData);
        const invalidData = splitData
            .filter((s) => !validData.length ||
            validData.every((o) => o.id.toLocaleLowerCase() !== s.toLocaleLowerCase() && o.text.toLocaleLowerCase() !== s.toLocaleLowerCase()))
            .map((s) => ({ id: s, text: s, invalid: true }));
        setItems([...validData, ...invalidData]);
    };
    const validItems = items?.filter((i) => !i.invalid);
    const searchResults = {
        search: {
            ids: validItems.map((i) => i.id),
            type: dataSource.tableName,
        },
    };
    return (React.createElement("div", { className: "hstack gap-3 ordino-dataset-searchbox", "data-testid": "ordino-dataset-searchbox" },
        React.createElement(AsyncPaginate, { className: "flex-fill", onPaste: onPaste, placeholder: placeholder, noOptionsMessage: () => 'No results found', isMulti: true, loadOptions: loadOptions, inputValue: inputValue, value: items, onChange: setItems, onInputChange: setInputValue, formatOptionLabel: formatOptionLabel, hideSelectedOptions: true, getOptionLabel: (opt) => opt.text, getOptionValue: (opt) => opt.id, captureMenuScroll: false, additional: {
                page: 0, // page starts from index 0
            }, components: {
                Input,
                Option: addDataTestId(option, 'async-paginate-option'),
                MultiValueRemove: addDataTestId(multiValueRemove, 'async-paginate-multiselect-remove'),
                ClearIndicator: addDataTestId(clearIndicator, 'async-paginate-clearindicator'),
                DropdownIndicator: addDataTestId(dropdownIndicator, 'async-paginate-dropdownindicator'),
            }, styles: {
                indicatorsContainer: (styles) => ({
                    ...styles,
                    maxHeight: '70px',
                    alignSelf: 'flex-end',
                }),
                valueContainer: (styles) => ({
                    ...styles,
                    maxHeight: '125px',
                    overflow: 'auto',
                }),
                multiValue: (styles, { data }) => ({
                    ...styles,
                    border: `1px solid #CCC`,
                    borderRadius: '3px',
                }),
                multiValueLabel: (styles, { data }) => ({
                    ...styles,
                    textDecoration: data.invalid ? 'line-through' : 'none',
                    color: data.color,
                    backgroundColor: 'white',
                    order: 2,
                    paddingLeft: '0',
                    paddingRight: '6px',
                }),
                multiValueRemove: (styles, { data }) => ({
                    ...styles,
                    color: data.invalid ? 'red' : '#999',
                    backgroundColor: 'white',
                    order: 1,
                    ':hover': {
                        color: '#333',
                        cursor: 'pointer',
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
                    // expand the Input Component div
                    flex: '1 1 auto',
                    // expand the Input Component child div
                    '> div': {
                        width: '100%',
                    },
                    // expand the Input Component input
                    input: {
                        width: '100% !important',
                        textAlign: 'left',
                    },
                }),
            } }),
        React.createElement("button", { type: "button", className: "btn btn-secondary", "data-testid": "open-button", disabled: !validItems?.length, onClick: (event) => onOpen(event, searchResults) }, "Open"),
        React.createElement("button", { type: "button", className: "btn btn-outline-secondary text-nowrap", "data-testid": "save-button", disabled: !validItems?.length, onClick: () => onSaveAsNamedSet(validItems) }, "Save as set")));
}
//# sourceMappingURL=DatasetSearchBox.js.map