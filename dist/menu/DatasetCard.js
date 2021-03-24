import React from 'react';
import { Card, Nav, Tab, Row } from 'react-bootstrap';
import { ENamedSetType, RestBaseUtils, RestStorageUtils } from 'tdp_core';
import { NamedSetList, useAsync, OrdinoContext } from 'ordino';
import { UserSession } from 'phovea_core';
import { DatasetSearchBox } from './DatasetSearchBox';
import { Species, SpeciesUtils } from 'tdp_gene';
export default function DatasetCard({ name, headerIcon, tabs, viewId, dataSource }) {
    var _a, _b;
    const { app } = React.useContext(OrdinoContext);
    const [dirtyNamedSets, setDirtyNamedSets] = React.useState(false);
    const loadPredefinedSet = React.useMemo(() => {
        return () => RestBaseUtils.getTDPData(dataSource.db, `${dataSource.base}_panel`)
            .then((panels) => {
            return [{
                    name: 'All',
                    type: ENamedSetType.CUSTOM,
                    subTypeKey: Species.SPECIES_SESSION_KEY,
                    subTypeFromSession: true,
                    subTypeValue: SpeciesUtils.getSelectedSpecies(),
                    description: '',
                    idType: '',
                    ids: '',
                    creator: ''
                }, ...panels
                    .map(function panel2NamedSet({ id, description, species }) {
                    return {
                        type: ENamedSetType.PANEL,
                        id,
                        name: id,
                        description,
                        subTypeKey: Species.SPECIES_SESSION_KEY,
                        subTypeFromSession: false,
                        subTypeValue: species,
                        idType: ''
                    };
                })];
        });
    }, [dataSource.idType]);
    const loadNamedSets = React.useMemo(() => {
        return () => RestStorageUtils.listNamedSets(dataSource.idType);
    }, [dataSource.idType, dirtyNamedSets]);
    const predefinedNamedSets = useAsync(loadPredefinedSet);
    const me = UserSession.getInstance().currentUserNameOrAnonymous();
    const namedSets = useAsync(loadNamedSets);
    const myNamedSets = { ...namedSets, ...{ value: (_a = namedSets.value) === null || _a === void 0 ? void 0 : _a.filter((d) => d.type === ENamedSetType.NAMEDSET && d.creator === me) } };
    const publicNamedSets = { ...namedSets, ...{ value: (_b = namedSets.value) === null || _b === void 0 ? void 0 : _b.filter((d) => d.type === ENamedSetType.NAMEDSET && d.creator !== me) } };
    const filterValue = (value, tab) => value === null || value === void 0 ? void 0 : value.filter((entry) => entry.subTypeValue === tab);
    const onNamedSetsChanged = () => setDirtyNamedSets((d) => !d);
    const onOpenNamedSet = (event, { namedSet, species }) => {
        event.preventDefault();
        const defaultSessionValues = {
            [Species.SPECIES_SESSION_KEY]: species
        };
        app.startNewSession(viewId, { namedSet }, defaultSessionValues);
    };
    const onOpenSearchResult = (event, { searchResult, species }) => {
        event.preventDefault();
        const defaultSessionValues = {
            [Species.SPECIES_SESSION_KEY]: species
        };
        app.startNewSession(viewId, searchResult, defaultSessionValues);
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("h4", { className: "text-left mt-4 mb-3" },
            React.createElement("i", { className: 'mr-2 ordino-icon-2 ' + headerIcon }),
            name),
        React.createElement(Card, { className: "shadow-sm" },
            React.createElement(Card.Body, { className: "p-3" },
                React.createElement(Tab.Container, { defaultActiveKey: tabs[0].id },
                    React.createElement(Nav, { className: "session-tab", variant: "pills" }, tabs.map((tab) => {
                        return (React.createElement(Nav.Item, { key: tab.id },
                            React.createElement(Nav.Link, { eventKey: tab.id },
                                React.createElement("i", { className: 'mr-2 ' + tab.tabIcon }),
                                tab.tabText)));
                    })),
                    React.createElement(Tab.Content, null, tabs.map((tab) => {
                        return (React.createElement(Tab.Pane, { key: tab.id, eventKey: tab.id, className: "mt-4" },
                            React.createElement(DatasetSearchBox, { placeholder: `Add ${name}`, dataSource: dataSource, onNamedSetsChanged: onNamedSetsChanged, onOpen: (event, searchResult) => { onOpenSearchResult(event, { searchResult, species: tab.id }); } }),
                            React.createElement(Row, { className: "mt-4" },
                                React.createElement(NamedSetList, { headerIcon: "fas fa-database", headerText: "Predefined Sets", onOpen: (event, namedSet) => { onOpenNamedSet(event, { namedSet, species: tab.id }); }, status: predefinedNamedSets.status, value: filterValue(predefinedNamedSets.value, tab.id) }),
                                React.createElement(NamedSetList, { headerIcon: "fas fa-user", headerText: "My Sets", onOpen: (event, namedSet) => { onOpenNamedSet(event, { namedSet, species: tab.id }); }, status: myNamedSets.status, value: filterValue(myNamedSets.value, tab.id) }),
                                React.createElement(NamedSetList, { headerIcon: "fas fa-users", headerText: "Public Sets", onOpen: (event, namedSet) => { onOpenNamedSet(event, { namedSet, species: tab.id }); }, status: publicNamedSets.status, value: filterValue(publicNamedSets.value, tab.id) }))));
                    })))))));
}
//# sourceMappingURL=DatasetCard.js.map