import { FileAnnotation, Tool } from '../common';

type MessageType = 'apiMessage' | 'userMessage';

interface IFileUpload {
  data?: string;
  type: string;
  name: string;
  mime: string;
}

interface IMessage {
  message: string;
  type: MessageType;
  role?: MessageType;
  content?: string;
}

export interface PredictionData {
  chatflowId: string;
  question: string;
  overrideConfig?: Record<string, any>;
  chatId?: string;
  streaming?: boolean;
  history?: IMessage[];
  uploads?: IFileUpload[];
  // leadEmail?: string;
  // action?: IAction;
}

export interface StreamResponse {
  event: string;
  data: string;
}

export interface NoStreamResponse {
  text?: string;
  json?: Record<string, any>;
  question: string;
  chatId: string;
  chatMessageId: string;
  sessionId: string;
  memoryType: string;
  sourceDocumennts?: Document[];
  usedTools?: Tool[];
  fileAnnotations?: FileAnnotation[];
}

export type PredictionResponse<T extends PredictionData> = T['streaming'] extends true
  ? AsyncGenerator<StreamResponse, void, unknown>
  : NoStreamResponse;

export interface PredictionApi {
  createPrediction<T extends PredictionData>(
    data: T,
  ): Promise<PredictionResponse<T>>;
}
