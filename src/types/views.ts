export type SearchMode = 'subject' | 'query' | 'Pins' | 'My Courses';

export type SearchPayload = {
  mode: SearchMode | null;
  text?: string;
};

export type MenuItem = {
  icon?: string | JSX.Element;
  label: string;
};

export type SnackBar = {
  message: string;
  id: number | undefined;
  label?: string;
  onClick?: (...args: any[]) => any;
};
