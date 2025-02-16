export class CreateSourceDto {
  name: string;
  type: 'WEBSITE' | 'FILE' | 'TEXT';
  rootUrl?: string;
  text?: string;
  chatflowId: string;
  urls?: {
    url: string;
    type: 'URL' | 'FILE';
  }[];
  autoFetch?: {
    cronExpression: string;
    isEnabled?: boolean;
    matchPattern?: string;
    excludePattern?: string;
    filePattern?: string;
  };
}
