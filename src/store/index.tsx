import { createContext } from 'react';

import { reaction } from 'mobx';
import PreferenceStore from './PreferenceStore';
import UserStore from './UserStore';
import NotificationStore from './NotificationStore';
import PlannerStore from './PlannerStore';

const notificationStore = new NotificationStore();
const preferenceStore = new PreferenceStore();
const userStore = new UserStore(notificationStore);
const plannerStore = new PlannerStore(notificationStore);

reaction(
  () => ({
    plannerCourses: plannerStore.plannerCourses.map((course) => course),
    key: plannerStore.currentPlanner,
  }),
  ({ plannerCourses, key }) => {
    plannerStore.updatePlanners(key, plannerCourses);
  }
);

export const PreferenceContext = createContext(null as PreferenceStore);
export const UserContext = createContext(null as UserStore);
export const NotificationContext = createContext(null as NotificationStore);
export const PlannerContext = createContext(null as PlannerStore);

export default function StoreProvider({ children }) {
  return (
    <PreferenceContext.Provider value={preferenceStore}>
      <UserContext.Provider value={userStore}>
        <PlannerContext.Provider value={plannerStore}>
          <NotificationContext.Provider value={notificationStore}>
            {children}
          </NotificationContext.Provider>
        </PlannerContext.Provider>
      </UserContext.Provider>
    </PreferenceContext.Provider>
  );
}
