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

export type SnackBar = {
  message: string;
  id: number | undefined;
  label?: string;
  onClick?: (...args: any[]) => any;
};
