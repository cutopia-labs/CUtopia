import { createContext } from 'react';

import ErrorStore from './ErrorStore';
import PreferenceStore from './PreferenceStore';
import UserStore from './UserStore';
import NotificationStore from './NotificationStore';

const notificationStore = new NotificationStore();
const errorStore = new ErrorStore();
const preferenceStore = new PreferenceStore();
const userStore = new UserStore(notificationStore);

export const ErrorContext = createContext(null as ErrorStore);
export const PreferenceContext = createContext(null as PreferenceStore);
export const UserContext = createContext(null as UserStore);
export const NotificationContext = createContext(null as NotificationStore);

export default function StoreProvider({ children }) {
  return (
    <ErrorContext.Provider value={errorStore}>
      <PreferenceContext.Provider value={preferenceStore}>
        <UserContext.Provider value={userStore}>
          <NotificationContext.Provider value={notificationStore}>
            {children}
          </NotificationContext.Provider>
        </UserContext.Provider>
      </PreferenceContext.Provider>
    </ErrorContext.Provider>
  );
}
