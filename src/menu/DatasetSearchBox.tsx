import React from 'react';
import { RestBaseUtils, IdTextPair, Select3Utils } from 'tdp_core';
import { components, FormatOptionLabelMeta } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import Highlighter from 'react-highlight-words';
import { IACommonListOptions } from 'tdp_gene';
import { GeneUtils, IDataSourceConfig } from '../common';

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

// functions to add data-testid attribute to react-select components
// eslint-disable-next-line
const addDataTestId = (Component, dataTestId) => (
  // eslint-disable-next-line
    (props) => (
      // eslint-disable-next-line
        <Component {...props}
        // eslint-disable-next-line
            innerProps={Object.assign({}, props.innerProps, {'data-testid': `${dataTestId}${props.data ? '-' + props.data.id : ''}`})} />));

function Input(props: any) {
  const { onPaste } = props.selectProps;
  const modifiedProps = { 'data-testid': 'async-paginate-input', ...props };
  delete modifiedProps.popoverType; // remove the "illegal" prop from the copy
  return <components.Input onPaste={onPaste} {...modifiedProps} />;
}

const clearIndicator = (props) => components.ClearIndicator && <components.ClearIndicator {...props} />;

const dropdownIndicator = (props) => components.DropdownIndicator && <components.DropdownIndicator {...props} />;

const option = (props) => components.Option && <components.Option {...props} />;

const multiValueRemove = (props) => components.MultiValueRemove && <components.MultiValueRemove {...props} />;

export function DatasetSearchBox({ placeholder, dataSource, onOpen, onSaveAsNamedSet, params = {}, tokenSeparators = /[\s;,]+/gm }: IDatasetSearchBoxProps) {
  const [items, setItems] = React.useState<IDatasetSearchOption[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const loadOptions = async (query: string, _, { page }: { page: number }) => {
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
  const formatOptionLabel = (option: IDatasetSearchOption, ctx: FormatOptionLabelMeta<IDatasetSearchOption, true>) => {
    // do not highlight selected elements
    if (ctx.selectValue?.some((o) => o.id === option.id)) {
      return option.text;
    }
    return (
      <>
        <Highlighter searchWords={[ctx.inputValue]} autoEscape textToHighlight={option.text} />
        {option.text !== option.id && <span className="small text-muted ms-1">{option.id}</span>}
      </>
    );
  };

  React.useEffect(() => {
    setInputValue('');
  }, [items]);

  const onPaste = async (event: React.ClipboardEvent) => {
    const pastedData = event.clipboardData.getData('text')?.toLocaleLowerCase();
    const splitData = Select3Utils.splitEscaped(pastedData, tokenSeparators, false)
      .map((d) => d.trim())
      .filter((d) => d !== '');
    const validData = await GeneUtils.validateGeneric(dataSource, splitData);

    const invalidData = splitData
      .filter(
        (s) =>
          !validData.length ||
          validData.every((o) => o.id.toLocaleLowerCase() !== s.toLocaleLowerCase() && o.text.toLocaleLowerCase() !== s.toLocaleLowerCase()),
      )
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

  return (
    <div className="hstack gap-3 ordino-dataset-searchbox" data-testid="ordino-dataset-searchbox">
      <AsyncPaginate
        className="flex-fill"
        onPaste={onPaste}
        placeholder={placeholder}
        noOptionsMessage={() => 'No results found'}
        isMulti
        loadOptions={loadOptions}
        inputValue={inputValue}
        value={items}
        onChange={setItems}
        onInputChange={setInputValue}
        formatOptionLabel={formatOptionLabel}
        hideSelectedOptions
        getOptionLabel={(opt) => opt.text}
        getOptionValue={(opt) => opt.id}
        captureMenuScroll={false}
        additional={{
          page: 0, // page starts from index 0
        }}
        components={{
          Input,
          Option: addDataTestId(option, 'async-paginate-option'),
          MultiValueRemove: addDataTestId(multiValueRemove, 'async-paginate-multiselect-remove'),
          ClearIndicator: addDataTestId(clearIndicator, 'async-paginate-clearindicator'),
          DropdownIndicator: addDataTestId(dropdownIndicator, 'async-paginate-dropdownindicator'),
        }}
        styles={{
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
        }}
      />
      <button
        type="button"
        className="btn btn-secondary"
        data-testid="open-button"
        disabled={!validItems?.length}
        onClick={(event) => onOpen(event, searchResults)}
      >
        Open
      </button>
      <button
        type="button"
        className="btn btn-outline-secondary"
        data-testid="save-button"
        disabled={!validItems?.length}
        onClick={() => onSaveAsNamedSet(validItems)}
      >
        Save as set
      </button>
    </div>
  );
}
