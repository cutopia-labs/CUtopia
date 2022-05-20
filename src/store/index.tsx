import { createContext, FC, useContext, useEffect, useState } from 'react';

import { reaction } from 'mobx';
import { enableStaticRendering } from 'mobx-react-lite';
import { isServer } from '../helpers';
import UserStore from './UserStore';
import ViewStore from './ViewStore';
import PlannerStore from './PlannerStore';

export let viewStore: ViewStore;
export let userStore: UserStore;
export let plannerStore: PlannerStore;

// enable static rendering ONLY on server
enableStaticRendering(isServer);

reaction(
  () => ({
    plannerCourses: plannerStore.plannerCourses?.map(course => course),
    key: plannerStore.currentPlannerKey,
  }),
  ({ plannerCourses, key }) => {
    plannerStore.updatePlanners(key, plannerCourses);
  }
);

const UserContext = createContext(null as UserStore);
const ViewContext = createContext(null as ViewStore);
const PlannerContext = createContext(null as PlannerStore);

export const useView = () => useContext(ViewContext);
export const useUser = () => useContext(UserContext);
export const usePlanner = () => useContext(PlannerContext);

export const getStores = () => {
  console.log('Store inited');
  if (isServer) {
    console.log('Store inited - Server');
    return {
      viewStore: new ViewStore(),
      userStore: new UserStore(viewStore),
      plannerStore: new PlannerStore(viewStore),
    };
  }
  if (!viewStore || !userStore || !plannerStore) {
    console.log('Store inited - Client');
    viewStore = new ViewStore();
    userStore = new UserStore(viewStore);
    plannerStore = new PlannerStore(viewStore);
  }
  return { viewStore, userStore, plannerStore };
};

const StoreProvider: FC = ({ children }) => {
  const { userStore, plannerStore, viewStore } = getStores();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    userStore.init();
    plannerStore.init();
    setReady(true);
  }, []);
  if (!ready) return null;
  return (
    <UserContext.Provider value={userStore}>
      <PlannerContext.Provider value={plannerStore}>
        <ViewContext.Provider value={viewStore}>
          {children}
        </ViewContext.Provider>
      </PlannerContext.Provider>
    </UserContext.Provider>
  );
};

export default StoreProvider;
