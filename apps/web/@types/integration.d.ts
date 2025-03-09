export interface Integration {
  id: string;
  name?: string;
  pageId?: string;
  type: 'FACEBOOK' | 'TELEGRAM';
  status: 'ENABLED' | 'DISABLED';
  chatflowId: string;
  createdAt: string;
}