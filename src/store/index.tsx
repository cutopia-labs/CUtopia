import { createContext } from 'react';

import PreferenceStore from './PreferenceStore';
import UserStore from './UserStore';
import NotificationStore from './NotificationStore';

const notificationStore = new NotificationStore();
const preferenceStore = new PreferenceStore();
const userStore = new UserStore(notificationStore);

export const PreferenceContext = createContext(null as PreferenceStore);
export const UserContext = createContext(null as UserStore);
export const NotificationContext = createContext(null as NotificationStore);

export default function StoreProvider({ children }) {
  return (
    <PreferenceContext.Provider value={preferenceStore}>
      <UserContext.Provider value={userStore}>
        <NotificationContext.Provider value={notificationStore}>
          {children}
        </NotificationContext.Provider>
      </UserContext.Provider>
    </PreferenceContext.Provider>
  );
}
