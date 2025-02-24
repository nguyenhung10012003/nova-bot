export interface Source {
  name: string;
  id: string;
  type: 'WEBSITE' | 'FILE' | 'TEXT';
  rootUrl?: string;
  text?: string;
  chatflowId: string;
  urls?: {
    url: string;
    type: 'URL' | 'FILE';
  }[];
  fetchSetting?: {
    autoFetch?: boolean;
    cronExpression: string;
    matchPattern?: string;
    excludePattern?: string;
    filePattern?: string;
    maxUrlsToCrawl?: number;
    maxDepth?: number;
  };
}
