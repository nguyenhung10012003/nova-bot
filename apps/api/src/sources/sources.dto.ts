export class CreateSourceDto {
  name: string;
  type: 'WEBSITE' | 'FILE' | 'TEXT';
  rootUrl?: string;
  text?: string[];
  chatflowId: string;
  urls?: {
    url: string;
    type: 'URL' | 'FILE';
  }[];
  fetchSetting?: {
    cronExpression: string;
    autoFetch?: boolean;
    matchPattern?: string;
    excludePattern?: string;
    filePattern?: string[];
    maxUrlsToCrawl?: number;
  };
}
