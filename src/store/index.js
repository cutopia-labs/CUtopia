import React, { createContext } from 'react';

import ErrorStore from './ErrorStore';
import PreferenceStore from './PreferenceStore';
import UserStore from './UserStore';
import NotificationStore from './NotificationStore';
import TaskStore from './TaskStore';

const notificationStore = new NotificationStore();
const errorStore = new ErrorStore();
const preferenceStore = new PreferenceStore();
const taskStore = new TaskStore(notificationStore);
const userStore = new UserStore(notificationStore);

export const ErrorContext = createContext();
export const PreferenceContext = createContext();
export const UserContext = createContext();
export const NotificationContext = createContext();
export const TaskContext = createContext();

export default function StoreProvider({ children }) {
  return (
    <ErrorContext.Provider value={errorStore}>
      <PreferenceContext.Provider value={preferenceStore}>
        <UserContext.Provider value={userStore}>
          <NotificationContext.Provider value={notificationStore}>
            <TaskContext.Provider value={taskStore}>
              {children}
            </TaskContext.Provider>
          </NotificationContext.Provider>
        </UserContext.Provider>
      </PreferenceContext.Provider>
    </ErrorContext.Provider>
  );
}
