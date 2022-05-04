import React from 'react';
import { ENamedSetType, RestBaseUtils, RestStorageUtils, StoreUtils, UserSession, UniqueIdManager, I18nextManager, IDTypeManager, useAsync, } from 'tdp_core';
import { NamedSetList, OrdinoContext } from 'ordino';
import { Species } from 'tdp_gene';
import { DatasetSearchBox } from './DatasetSearchBox';
export default function DatasetCard({ name, icon, tabs, startViewId, dataSource, cssClass, tokenSeparators }) {
    var _a, _b;
    const { app } = React.useContext(OrdinoContext);
    const [dirtyNamedSets, setDirtyNamedSets] = React.useState(false);
    const loadPredefinedSet = React.useMemo(() => {
        return async () => {
            const panels = await RestBaseUtils.getTDPData(dataSource.db, `${dataSource.base}_panel`);
            const uniqueSpecies = [...new Set(panels.map(({ species }) => species))];
            return [
                // first add an `All` named set for each species ...
                ...uniqueSpecies.map((species) => {
                    return {
                        name: I18nextManager.getInstance().i18n.t(`tdp:datasetCard.predefinedSet.all.name`),
                        type: ENamedSetType.CUSTOM,
                        subTypeKey: Species.SPECIES_SESSION_KEY,
                        subTypeFromSession: true,
                        subTypeValue: species,
                        description: I18nextManager.getInstance().i18n.t(`tdp:datasetCard.predefinedSet.all.description`, { species }),
                        idType: '',
                        ids: '',
                        creator: '',
                    };
                }),
                // ... then add all the predefined sets loaded from the backend
                ...panels.map(({ id, description, species }) => {
                    return {
                        type: ENamedSetType.PANEL,
                        id,
                        name: id,
                        description,
                        subTypeKey: Species.SPECIES_SESSION_KEY,
                        subTypeFromSession: false,
                        subTypeValue: species,
                        idType: '',
                    };
                }),
            ];
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataSource.idType]);
    const loadNamedSets = React.useMemo(() => {
        return () => RestStorageUtils.listNamedSets(dataSource.idType);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataSource.idType, dirtyNamedSets]);
    const predefinedNamedSets = useAsync(loadPredefinedSet, []);
    const me = UserSession.getInstance().currentUserNameOrAnonymous();
    const namedSets = useAsync(loadNamedSets, []);
    const myNamedSets = { ...namedSets, ...{ value: (_a = namedSets.value) === null || _a === void 0 ? void 0 : _a.filter((d) => d.type === ENamedSetType.NAMEDSET && d.creator === me) } };
    const publicNamedSets = { ...namedSets, ...{ value: (_b = namedSets.value) === null || _b === void 0 ? void 0 : _b.filter((d) => d.type === ENamedSetType.NAMEDSET && d.creator !== me) } };
    const filterValue = (value, tab) => value === null || value === void 0 ? void 0 : value.filter((entry) => entry.subTypeValue === tab);
    const onOpenNamedSet = (event, { namedSet, species }) => {
        event.preventDefault();
        const defaultSessionValues = {
            [Species.SPECIES_SESSION_KEY]: species,
        };
        // store the selected species/tab as it is necessary in the rankings
        UserSession.getInstance().store(Species.SPECIES_SESSION_KEY, species);
        app.startNewSession(startViewId, { namedSet }, defaultSessionValues);
    };
    const onOpenSearchResult = (event, { searchResult, species }) => {
        event.preventDefault();
        const defaultSessionValues = {
            [Species.SPECIES_SESSION_KEY]: species,
        };
        // store the selected species
        UserSession.getInstance().store(Species.SPECIES_SESSION_KEY, species);
        app.startNewSession(startViewId, searchResult, defaultSessionValues);
    };
    const onSaveAsNamedSet = (items, subtype) => {
        StoreUtils.editDialog(null, I18nextManager.getInstance().i18n.t(`tdp:core.editDialog.listOfEntities.default`), async (datasetName, description, isPublic) => {
            const idStrings = items === null || items === void 0 ? void 0 : items.map((i) => i.id);
            const idType = IDTypeManager.getInstance().resolveIdType(dataSource.idType);
            await RestStorageUtils.saveNamedSet(datasetName, idType, idStrings, subtype, description, isPublic);
            setDirtyNamedSets((d) => !d);
        });
    };
    const id = React.useMemo(() => UniqueIdManager.getInstance().uniqueId(), []);
    const activeTabIndex = 0;
    return (React.createElement("div", { className: `ordino-dataset ${cssClass || ''}` },
        React.createElement("h4", { className: "text-start mb-3" },
            React.createElement("i", { className: `me-2 ordino-icon-2 ${icon}` }),
            name),
        React.createElement("div", { className: "card shadow-sm" },
            React.createElement("div", { className: "card-body p-3" },
                React.createElement("ul", { className: "nav nav-pills session-tab" }, tabs.map((tab, index) => {
                    return (React.createElement("li", { key: tab.id, className: "nav-item", role: "presentation" },
                        React.createElement("a", { className: `nav-link ${index === activeTabIndex ? 'active' : ''}`, id: `dataset-tab-${tab.id}-${id}`, "data-bs-toggle": "tab", href: `#dataset-panel-${tab.id}-${id}`, role: "tab", "aria-controls": `dataset-panel-${tab.id}-${id}`, "aria-selected": index === activeTabIndex },
                            React.createElement("i", { className: `me-2 ${tab.icon}` }),
                            tab.name)));
                })),
                React.createElement("div", { className: "tab-content" }, tabs.map((tab, index) => {
                    const separators = tokenSeparators ? { tokenSeparators } : null;
                    return (React.createElement("div", { key: tab.id, className: `tab-pane fade mt-4 ${index === activeTabIndex ? 'show active' : ''}`, role: "tabpanel", id: `dataset-panel-${tab.id}-${id}`, "aria-labelledby": `dataset-tab-${tab.id}-${id}` },
                        React.createElement(DatasetSearchBox, { placeholder: `Add ${name}`, dataSource: dataSource, params: { species: tab.id }, onSaveAsNamedSet: (items) => onSaveAsNamedSet(items, { key: Species.SPECIES_SESSION_KEY, value: tab.id }), onOpen: (event, searchResult) => {
                                onOpenSearchResult(event, { searchResult, species: tab.id });
                            }, ...separators }),
                        React.createElement("div", { className: "row mt-4" },
                            React.createElement(NamedSetList, { headerIcon: "fas fa-database", headerText: "Predefined Sets", onOpen: (event, namedSet) => {
                                    onOpenNamedSet(event, { namedSet, species: tab.id });
                                }, status: predefinedNamedSets.status, value: filterValue(predefinedNamedSets.value, tab.id) }),
                            React.createElement(NamedSetList, { headerIcon: "fas fa-user", headerText: "My Sets", onOpen: (event, namedSet) => {
                                    onOpenNamedSet(event, { namedSet, species: tab.id });
                                }, status: myNamedSets.status, value: filterValue(myNamedSets.value, tab.id) }),
                            React.createElement(NamedSetList, { headerIcon: "fas fa-users", headerText: "Other Sets", onOpen: (event, namedSet) => {
                                    onOpenNamedSet(event, { namedSet, species: tab.id });
                                }, status: publicNamedSets.status, value: filterValue(publicNamedSets.value, tab.id) }))));
                }))))));
}
//# sourceMappingURL=DatasetCard.js.map