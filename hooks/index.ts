import { useContext } from 'react';
import { PlannerContext, UserContext, ViewContext } from '../store';

export const useUser = () => useContext(UserContext);
export const usePlanner = () => useContext(PlannerContext);
export const useView = () => useContext(ViewContext);
