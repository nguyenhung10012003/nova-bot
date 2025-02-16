export type ChatflowType = 'CHATFLOW' | 'MULTIAGENT';

export interface Chatflow {
  id: string;
  name: string;
  flowData?: string;
  deployed?: boolean;
  isPublic?: boolean;
  apikeyid?: string;
  chatbotConfig?: string;
  apiConfig?: string;
  analytic?: string;
  speechToText?: string;
  category?: string;
  createdDate: string;
  updatedDate: string;
  type: ChatflowType;
}

export interface ChatflowsApi {
  getChatflows: () => Promise<Chatflow[]>;
  getChatflow: (id: string) => Promise<Chatflow>;
  createChatflow: (data: Chatflow) => Promise<Chatflow>;
  updateChatflow: (id: string, data: Partial<Chatflow>) => Promise<Chatflow>;
  deleteChatflow: (id: string) => Promise<Chatflow>;
}
