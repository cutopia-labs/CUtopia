import { createContext } from 'react';

import { reaction } from 'mobx';
import UserStore from './UserStore';
import ViewStore from './ViewStore';
import PlannerStore from './PlannerStore';

export const viewStore = new ViewStore();
export const userStore = new UserStore(viewStore);
export const plannerStore = new PlannerStore(viewStore);

reaction(
  () => ({
    plannerCourses: plannerStore.plannerCourses?.map(course => course),
    key: plannerStore.currentPlannerKey,
  }),
  ({ plannerCourses, key }) => {
    plannerStore.updatePlanners(key, plannerCourses);
  }
);

export const UserContext = createContext(null as UserStore);
export const ViewContext = createContext(null as ViewStore);
export const PlannerContext = createContext(null as PlannerStore);

export default function StoreProvider({ children }) {
  return (
    <UserContext.Provider value={userStore}>
      <PlannerContext.Provider value={plannerStore}>
        <ViewContext.Provider value={viewStore}>
          {children}
        </ViewContext.Provider>
      </PlannerContext.Provider>
    </UserContext.Provider>
  );
}
