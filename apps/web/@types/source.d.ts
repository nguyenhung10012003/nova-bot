export interface Source {
  name: string;
  id: string;
  type: 'WEBSITE' | 'FILE' | 'TEXT';
  rootUrl?: string;
  text?: string;
  chatflowId: string;
  sourceStatus: 'CREATED' | 'PROCESSING' | 'PROCESSED' | 'SYNED' | 'ERROR';
  urls?: {
    url: string;
    type: 'URL' | 'FILE';
  }[];
  files?: {
    name: string;
    url: string;
    size: number | string;
  }[];
  fetchSetting?: {
    autoFetch?: boolean;
    cronExpression: string;
    matchPattern?: string;
    excludePattern?: string;
    filePattern?: string[];
    maxUrlsToCrawl?: number;
    maxDepth?: number;
  };
}
