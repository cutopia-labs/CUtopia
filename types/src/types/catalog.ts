export type CatalogManifest = {
  schemaVersion: 1;
  version: string;
  currentTerm: string;
  availableTerms: string[];
  publishedAt: string;
  checkedAt: string;
  subjects: Record<string, string>;
  resources: {
    courseList: string;
    instructors: string;
    faculties: string;
    courseIds: string;
  };
};
