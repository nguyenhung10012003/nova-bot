export class ChatMessageDto {
  chatSessionId?: string;
  chatflowId: string;
  message?: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
  recipientType?: 'USER' | 'BOT';
}
