import React from 'react';
import { I18nextManager } from 'visyn_core/i18n';
import { IDTypeManager } from 'visyn_core/idtype';
import { GlobalEventHandler } from 'visyn_core/base';
import { useAsync } from 'visyn_core/hooks';
import { UserSession } from 'visyn_core/security';
import { ENamedSetType, RestBaseUtils, RestStorageUtils, StoreUtils, UniqueIdManager, AView } from 'tdp_core';
import { NamedSetList, OrdinoContext } from 'ordino';
import { DatasetSearchBox } from './DatasetSearchBox';
import { Species } from '../common';
export default function DatasetCard({ name, icon, tabs, startViewId, dataSource, cssClass, tokenSeparators }) {
    const testId = `dataset-card-${cssClass}`;
    const { app } = React.useContext(OrdinoContext);
    const [namedSets, setNamedSets] = React.useState([]);
    const [dirtyNamedSets, setDirtyNamedSets] = React.useState(true);
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
    const loadNamedSets = React.useCallback(async () => {
        // if dirty is false do not reload data again
        if (!dirtyNamedSets) {
            return;
        }
        setNamedSets(await RestStorageUtils.listNamedSets(dataSource.idType));
        setDirtyNamedSets(false);
    }, [dataSource.idType, dirtyNamedSets]);
    React.useEffect(() => {
        const entryPointChanged = () => setDirtyNamedSets(true);
        GlobalEventHandler.getInstance().on(AView.EVENT_UPDATE_ENTRY_POINT, entryPointChanged);
        return () => {
            GlobalEventHandler.getInstance().off(AView.EVENT_UPDATE_ENTRY_POINT, entryPointChanged);
        };
    }, []);
    const predefinedNamedSets = useAsync(loadPredefinedSet, []);
    const me = UserSession.getInstance().currentUserNameOrAnonymous();
    const { status: namedSetsStatus } = useAsync(loadNamedSets, []);
    const myNamedSets = { ...namedSets, ...{ value: namedSets?.filter((d) => d.type === ENamedSetType.NAMEDSET && d.creator === me) } };
    const publicNamedSets = { ...namedSets, ...{ value: namedSets?.filter((d) => d.type === ENamedSetType.NAMEDSET && d.creator !== me) } };
    const filterValue = (value, tab) => value?.filter((entry) => entry.subTypeValue === tab);
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
            const idStrings = items?.map((i) => i.id);
            const idType = IDTypeManager.getInstance().resolveIdType(dataSource.idType);
            await RestStorageUtils.saveNamedSet(datasetName, idType, idStrings, subtype, description, isPublic);
            setDirtyNamedSets(true);
        });
    };
    const id = React.useMemo(() => UniqueIdManager.getInstance().uniqueId(), []);
    const activeTabIndex = 0;
    return (React.createElement("div", { className: `ordino-dataset ${cssClass || ''}`, "data-testid": testId },
        React.createElement("h4", { className: "text-start mb-3" },
            React.createElement("i", { className: `me-2 ordino-icon-2 ${icon}` }),
            name),
        React.createElement("div", { className: "card shadow-sm" },
            React.createElement("div", { className: "card-body p-3" },
                React.createElement("ul", { className: "nav nav-pills session-tab" }, tabs.map((tab, index) => {
                    return (React.createElement("li", { key: tab.id, className: "nav-item", role: "presentation" },
                        React.createElement("a", { className: `nav-link ${index === activeTabIndex ? 'active' : ''}`, "data-testid": `${tab.id}-link`, id: `dataset-tab-${tab.id}-${id}`, "data-bs-toggle": "tab", href: `#dataset-panel-${tab.id}-${id}`, role: "tab", "aria-controls": `dataset-panel-${tab.id}-${id}`, "aria-selected": index === activeTabIndex },
                            React.createElement("i", { className: `me-2 ${tab.icon}` }),
                            tab.name)));
                })),
                React.createElement("div", { className: "tab-content" }, tabs.map((tab, index) => {
                    const separators = tokenSeparators ? { tokenSeparators } : null;
                    return (React.createElement("div", { key: tab.id, className: `tab-pane fade mt-4 ${index === activeTabIndex ? 'show active' : ''}`, "data-testid": `${tab.id}-tab`, role: "tabpanel", id: `dataset-panel-${tab.id}-${id}`, "aria-labelledby": `dataset-tab-${tab.id}-${id}` },
                        React.createElement(DatasetSearchBox, { placeholder: `Add ${name}`, dataSource: dataSource, params: { species: tab.id }, onSaveAsNamedSet: (items) => onSaveAsNamedSet(items, { key: Species.SPECIES_SESSION_KEY, value: tab.id }), onOpen: (event, searchResult) => {
                                onOpenSearchResult(event, { searchResult, species: tab.id });
                            }, ...separators }),
                        React.createElement("div", { className: "row mt-4" },
                            React.createElement(NamedSetList, { headerIcon: "fas fa-database", headerText: "Predefined Sets", onOpen: (event, namedSet) => {
                                    onOpenNamedSet(event, { namedSet, species: tab.id });
                                }, onEditNamedSet: () => setDirtyNamedSets(true), onDeleteNamedSet: () => setDirtyNamedSets(true), status: predefinedNamedSets.status, value: filterValue(predefinedNamedSets.value, tab.id) }),
                            React.createElement(NamedSetList, { headerIcon: "fas fa-user", headerText: "My Sets", onOpen: (event, namedSet) => {
                                    onOpenNamedSet(event, { namedSet, species: tab.id });
                                }, onEditNamedSet: () => setDirtyNamedSets(true), onDeleteNamedSet: () => setDirtyNamedSets(true), status: namedSetsStatus, value: filterValue(myNamedSets.value, tab.id) }),
                            React.createElement(NamedSetList, { headerIcon: "fas fa-users", headerText: "Other Sets", onOpen: (event, namedSet) => {
                                    onOpenNamedSet(event, { namedSet, species: tab.id });
                                }, onEditNamedSet: () => setDirtyNamedSets(true), onDeleteNamedSet: () => setDirtyNamedSets(true), status: namedSetsStatus, value: filterValue(publicNamedSets.value, tab.id) }))));
                }))))));
}
//# sourceMappingURL=DatasetCard.js.map