export type SearchMode = 'subject' | 'query' | 'Pins' | 'My Courses';

export type SearchPayload = {
  mode: SearchMode | null;
  text?: string;
  showAvalibility?: boolean;
};

export interface MenuItem {
  icon?: string | JSX.Element;
  label: string;
}

export interface PlannerItem extends MenuItem {
  key: number;
}

export interface SnackBarProps {
  message: string;
  label?: string;
  onClick?: (...args: any[]) => any;
  isAlert?: boolean;
}

export interface SnackBar extends SnackBarProps {
  id: number | undefined;
}
