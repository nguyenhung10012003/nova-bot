export type ChatMessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';

export type ChatMessageStatus = 'CREATED' | 'SENT' | 'DELIVERED' | 'READ';

export type ChatRecipientType = 'USER' | 'BOT';

export interface ChatMessage {
  id?: string;
  message?: string;
  chatSessionId?: string;
  file?: string[];
  type: ChatMessageType;
  status: ChatMessageStatus;
  recipientType: ChatRecipientType;
  createdAt?: Date;
}

export interface ChatSession {
  id?: string;
  title?: string;
  createdAt?: Date;
}