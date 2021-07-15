type SearchMode = 'subject' | 'query' | 'Pins' | 'My Courses';

type SearchPayload = {
  mode: SearchMode;
  text?: string;
};

type MenuItem = {
  icon?: string | JSX.Element;
  label: string;
};

export type { SearchMode, SearchPayload, MenuItem };
