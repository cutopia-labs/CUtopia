import { DialogProps } from '@material-ui/core';
import { AlertProps } from '@material-ui/lab';

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
