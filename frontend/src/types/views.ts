import { DialogProps } from '@mui/material';
import { AlertProps } from '@mui/lab';
import UserStore from '../store/UserStore';
import { CourseSearchItem } from './courses';

export type DatedData<T> = {
  value: T;
  time: number;
};

export type SearchMode = 'subject' | 'query' | 'Pins' | 'My Courses';

export type SearchPayload = {
  mode: SearchMode | null;
  text?: string;
  showAvalibility?: boolean;
  offerredOnly?: boolean;
};

export interface MenuItem {
  icon?: string | JSX.Element;
  label: string;
}

export interface PlannerItem extends MenuItem {
  id: string;
}

export interface SnackBarProps extends AlertProps {
  message: string;
  label?: string;
  onClick?: (...args: any[]) => any;
}

export interface SnackBar extends SnackBarProps {
  snackbarId: number | undefined;
}

export type DialogKeys = 'userSettings' | 'reportIssues';

export type Dialog = {
  key: DialogKeys;
  props?: Partial<DialogProps>;
  contentProps?: Record<string, any>;
};

export type CourseSearchList = Record<string, CourseSearchItem[]>;

export type DataWithETag<T = any> = {
  data: T;
  etag: number;
};

export type CourseQuery = {
  payload: SearchPayload;
  user?: UserStore;
  limit?: number;
  offerredOnly?: boolean;
};

export type LecturerQuery = {
  payload: string;
  limit: number;
};

export type DataConfig = {
  expire: number;
  fetchKey?: string; // default same as store key
};
