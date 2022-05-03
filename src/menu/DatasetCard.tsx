import React from 'react';
import {
  INamedSet,
  ENamedSetType,
  RestBaseUtils,
  RestStorageUtils,
  StoreUtils,
  IdTextPair,
  UserSession,
  UniqueIdManager,
  I18nextManager,
  IDTypeManager,
  useAsync,
} from 'tdp_core';
import { NamedSetList, OrdinoContext } from 'ordino';
import { Species, SpeciesUtils, IACommonListOptions } from 'tdp_gene';
import { DatasetSearchBox } from './DatasetSearchBox';
import { IPublicDbStartMenuDatasetSectionDesc } from '../base/extensions';

export default function DatasetCard({ name, icon, tabs, startViewId, dataSource, cssClass, tokenSeparators }: IPublicDbStartMenuDatasetSectionDesc) {
  const { app } = React.useContext(OrdinoContext);
  const [dirtyNamedSets, setDirtyNamedSets] = React.useState(false);

  const loadPredefinedSet = React.useMemo<() => Promise<INamedSet[]>>(() => {
    return async () => {
      const panels: { id: string; description: string; species: string }[] = await RestBaseUtils.getTDPData(dataSource.db, `${dataSource.base}_panel`);
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
          } as INamedSet;
        }),
        // ... then add all the predefined sets loaded from the backend
        ...panels.map(({ id, description, species }): INamedSet => {
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

  const loadNamedSets = React.useMemo<() => Promise<INamedSet[]>>(() => {
    return () => RestStorageUtils.listNamedSets(dataSource.idType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource.idType, dirtyNamedSets]);

  const predefinedNamedSets = useAsync(loadPredefinedSet, []);
  const me = UserSession.getInstance().currentUserNameOrAnonymous();
  const namedSets = useAsync(loadNamedSets, []);
  const myNamedSets = { ...namedSets, ...{ value: namedSets.value?.filter((d) => d.type === ENamedSetType.NAMEDSET && d.creator === me) } };
  const publicNamedSets = { ...namedSets, ...{ value: namedSets.value?.filter((d) => d.type === ENamedSetType.NAMEDSET && d.creator !== me) } };
  const filterValue = (value: INamedSet[], tab: string) => value?.filter((entry) => entry.subTypeValue === tab);

  const onOpenNamedSet = (event: React.MouseEvent<HTMLElement>, { namedSet, species }: { namedSet: INamedSet; species: string }) => {
    event.preventDefault();

    const defaultSessionValues = {
      [Species.SPECIES_SESSION_KEY]: species,
    };

    // store the selected species/tab as it is necessary in the rankings
    UserSession.getInstance().store(Species.SPECIES_SESSION_KEY, species);

    app.startNewSession(startViewId, { namedSet }, defaultSessionValues);
  };

  const onOpenSearchResult = (
    event: React.MouseEvent<HTMLElement>,
    { searchResult, species }: { searchResult: Partial<IACommonListOptions>; species: string },
  ) => {
    event.preventDefault();

    const defaultSessionValues = {
      [Species.SPECIES_SESSION_KEY]: species,
    };
    // store the selected species
    UserSession.getInstance().store(Species.SPECIES_SESSION_KEY, species);

    app.startNewSession(startViewId, searchResult, defaultSessionValues);
  };

  const onSaveAsNamedSet = (items: IdTextPair[], subtype: { key: string; value: string }) => {
    StoreUtils.editDialog(
      null,
      I18nextManager.getInstance().i18n.t(`tdp:core.editDialog.listOfEntities.default`),
      async (datasetName, description, isPublic) => {
        const idStrings = items?.map((i) => i.id);
        const idType = IDTypeManager.getInstance().resolveIdType(dataSource.idType);
        await RestStorageUtils.saveNamedSet(datasetName, idType, idStrings, subtype, description, isPublic);
        setDirtyNamedSets((d) => !d);
      },
    );
  };

  const id = React.useMemo(() => UniqueIdManager.getInstance().uniqueId(), []);
  const activeTabIndex = 0;

  return (
    <div className={`ordino-dataset ${cssClass || ''}`}>
      <h4 className="text-start mb-3">
        <i className={`me-2 ordino-icon-2 ${icon}`} />
        {name}
      </h4>
      <div className="card shadow-sm">
        <div className="card-body p-3">
          <ul className="nav nav-pills session-tab">
            {tabs.map((tab, index) => {
              return (
                <li key={tab.id} className="nav-item" role="presentation">
                  <a
                    className={`nav-link ${index === activeTabIndex ? 'active' : ''}`}
                    id={`dataset-tab-${tab.id}-${id}`}
                    data-bs-toggle="tab"
                    href={`#dataset-panel-${tab.id}-${id}`}
                    role="tab"
                    aria-controls={`dataset-panel-${tab.id}-${id}`}
                    aria-selected={index === activeTabIndex}
                  >
                    <i className={`me-2 ${tab.icon}`} />
                    {tab.name}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="tab-content">
            {tabs.map((tab, index) => {
              const separators = tokenSeparators ? { tokenSeparators } : null;
              return (
                <div
                  key={tab.id}
                  className={`tab-pane fade mt-4 ${index === activeTabIndex ? 'show active' : ''}`}
                  role="tabpanel"
                  id={`dataset-panel-${tab.id}-${id}`}
                  aria-labelledby={`dataset-tab-${tab.id}-${id}`}
                >
                  <DatasetSearchBox
                    placeholder={`Add ${name}`}
                    dataSource={dataSource}
                    params={{ species: tab.id }}
                    onSaveAsNamedSet={(items: IdTextPair[]) => onSaveAsNamedSet(items, { key: Species.SPECIES_SESSION_KEY, value: tab.id })}
                    onOpen={(event, searchResult: Partial<IACommonListOptions>) => {
                      onOpenSearchResult(event, { searchResult, species: tab.id });
                    }}
                    {...separators}
                  />
                  <div className="row mt-4">
                    <NamedSetList
                      headerIcon="fas fa-database"
                      headerText="Predefined Sets"
                      onOpen={(event, namedSet: INamedSet) => {
                        onOpenNamedSet(event, { namedSet, species: tab.id });
                      }}
                      status={predefinedNamedSets.status}
                      value={filterValue(predefinedNamedSets.value, tab.id)}
                    />
                    <NamedSetList
                      headerIcon="fas fa-user"
                      headerText="My Sets"
                      onOpen={(event, namedSet: INamedSet) => {
                        onOpenNamedSet(event, { namedSet, species: tab.id });
                      }}
                      status={myNamedSets.status}
                      value={filterValue(myNamedSets.value, tab.id)}
                    />
                    <NamedSetList
                      headerIcon="fas fa-users"
                      headerText="Other Sets"
                      onOpen={(event, namedSet: INamedSet) => {
                        onOpenNamedSet(event, { namedSet, species: tab.id });
                      }}
                      status={publicNamedSets.status}
                      value={filterValue(publicNamedSets.value, tab.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
