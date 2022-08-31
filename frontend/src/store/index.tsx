import { createContext, useContext, useEffect, useState } from 'react';
import { enableStaticRendering } from 'mobx-react-lite';

import { FCC } from '../types/general';
import { isServer } from '../helpers';
import UserStore from './UserStore';
import ViewStore from './ViewStore';
import PlannerStore from './PlannerStore';
import DataStore from './DataStore';

export let viewStore: ViewStore;
export let userStore: UserStore;
export let plannerStore: PlannerStore;
export let dataStore: DataStore;

// enable static rendering ONLY on server
enableStaticRendering(isServer);

const UserContext = createContext(null as UserStore);
const ViewContext = createContext(null as ViewStore);
const PlannerContext = createContext(null as PlannerStore);
const DataContext = createContext(null as DataStore);

export const useView = () => useContext(ViewContext);
export const useUser = () => useContext(UserContext);
export const usePlanner = () => useContext(PlannerContext);
export const useData = () => useContext(DataContext);

export const getStores = () => {
  if (isServer) {
    return {
      viewStore: new ViewStore(),
      dataStore: new DataStore(),
      userStore: new UserStore(viewStore, plannerStore),
      plannerStore: new PlannerStore(viewStore),
    };
  }
  if (!viewStore || !userStore || !plannerStore || !dataStore) {
    viewStore = new ViewStore();
    dataStore = new DataStore();
    plannerStore = new PlannerStore(viewStore);
    userStore = new UserStore(viewStore, plannerStore);
  }
  return { viewStore, userStore, plannerStore, dataStore };
};

const StoreProvider: FCC = ({ children }) => {
  const { userStore, plannerStore, viewStore, dataStore } = getStores();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    userStore.init();
    plannerStore.init();
    dataStore.init();
    setReady(true);
  }, []);
  if (!ready) return null;
  return (
    <UserContext.Provider value={userStore}>
      <DataContext.Provider value={dataStore}>
        <PlannerContext.Provider value={plannerStore}>
          <ViewContext.Provider value={viewStore}>
            {children}
          </ViewContext.Provider>
        </PlannerContext.Provider>
      </DataContext.Provider>
    </UserContext.Provider>
  );
};

export default StoreProvider;
