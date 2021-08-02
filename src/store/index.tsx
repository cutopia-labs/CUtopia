import { createContext } from 'react';

import { reaction } from 'mobx';
import PreferenceStore from './PreferenceStore';
import UserStore from './UserStore';
import ViewStore from './ViewStore';
import PlannerStore from './PlannerStore';

const viewStore = new ViewStore();
const preferenceStore = new PreferenceStore();
const userStore = new UserStore(viewStore);
const plannerStore = new PlannerStore(viewStore);

reaction(
  () => ({
    plannerCourses: plannerStore.plannerCourses.map((course) => course),
    key: plannerStore.currentPlannerKey,
  }),
  ({ plannerCourses, key }) => {
    plannerStore.updatePlanners(key, plannerCourses);
  }
);

export const PreferenceContext = createContext(null as PreferenceStore);
export const UserContext = createContext(null as UserStore);
export const ViewContext = createContext(null as ViewStore);
export const PlannerContext = createContext(null as PlannerStore);

export default function StoreProvider({ children }) {
  return (
    <PreferenceContext.Provider value={preferenceStore}>
      <UserContext.Provider value={userStore}>
        <PlannerContext.Provider value={plannerStore}>
          <ViewContext.Provider value={viewStore}>
            {children}
          </ViewContext.Provider>
        </PlannerContext.Provider>
      </UserContext.Provider>
    </PreferenceContext.Provider>
  );
}
