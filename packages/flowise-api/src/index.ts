import { Chatflow, ChatflowsApi } from './chatflows';
import { ApiClientOptions } from './common';
import {
  PredictionApi,
  PredictionData,
  PredictionResponse,
} from './prediction';
import {
  UpsertVectorData,
  UpsertVectorResponse,
  VectorUpsertApi,
} from './vector-upsert';

export class FlowiseApi
  implements PredictionApi, VectorUpsertApi, ChatflowsApi
{
  baseUrl: string;
  apiKey: string;

  constructor(options?: ApiClientOptions) {
    this.baseUrl = options?.baseUrl || 'http://localhost:3000';
    this.apiKey = options?.apiKey || '';
  }

  async canStream(chatflowId: string): Promise<boolean> {
    // Check if chatflow is available to stream
    const chatFlowStreamingUrl = `${this.baseUrl}/api/v1/chatflows-streaming/${chatflowId}`;
    const resp = await fetch(chatFlowStreamingUrl, {
      method: 'GET',
    });

    const chatFlowStreamingData = await resp.json();
    return chatFlowStreamingData.isStreaming || false;
  }

  async createPrediction<T extends PredictionData>(
    data: T,
  ): Promise<PredictionResponse<T>> {
    const { chatflowId, streaming } = data;

    const isChatFlowAvailableToStream = await this.canStream(chatflowId);

    const predictionUrl = `${this.baseUrl}/api/v1/prediction/${chatflowId}`;

    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    if (this.apiKey) {
      (options.headers as Record<string, string>)['Authorization'] =
        `Bearer ${this.apiKey}`;
    }

    if (isChatFlowAvailableToStream && streaming) {
      return {
        async *[Symbol.asyncIterator]() {
          const response = await fetch(predictionUrl, options);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.trim() === '') continue;
                if (line.startsWith('data:')) {
                  const stringifiedJson = line.replace('data:', '');
                  const event = JSON.parse(stringifiedJson);
                  yield event;
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        },
      } as unknown as Promise<PredictionResponse<T>>;
    } else {
      try {
        const response = await fetch(predictionUrl, options);
        const resp = await response.json();
        return resp as Promise<PredictionResponse<T>>;
      } catch (error) {
        throw new Error('Error creating prediction');
      }
    }
  }

  async upsertVector(data: UpsertVectorData): Promise<UpsertVectorResponse> {
    const upsertVectorUrl = `${this.baseUrl}/api/v1/vector/upsert/${data.chatflowId}`;

    const options: RequestInit = {
      method: 'POST',
      body: JSON.stringify(data),
    };

    return this.sendRequest(upsertVectorUrl, options);
  }

  async getChatflows(): Promise<Chatflow[]> {
    const chatflowsUrl = `${this.baseUrl}/api/v1/chatflows`;

    return this.sendRequest(chatflowsUrl, {
      method: 'GET',
    });
  }

  async getChatflow(id: string): Promise<Chatflow> {
    const chatflowUrl = `${this.baseUrl}/api/v1/chatflows/${id}`;

    return this.sendRequest(chatflowUrl, {
      method: 'GET',
    });
  }

  async createChatflow(data: Chatflow): Promise<Chatflow> {
    const chatflowsUrl = `${this.baseUrl}/api/v1/chatflows`;

    return this.sendRequest(chatflowsUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateChatflow(id: string, data: Partial<Chatflow>): Promise<Chatflow> {
    const chatflowUrl = `${this.baseUrl}/api/v1/chatflows/${id}`;

    return this.sendRequest(chatflowUrl, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteChatflow(id: string): Promise<Chatflow> {
    const chatflowUrl = `${this.baseUrl}/api/v1/chatflows/${id}`;

    return this.sendRequest(chatflowUrl, {
      method: 'DELETE',
    });
  }

  private async sendRequest<T>(url: string, options: RequestInit): Promise<T> {
    if (!options.headers) {
      options.headers = {};
    }
    
    if (this.apiKey) {
      (options.headers as Record<string, string>)['Authorization'] =
        `Bearer ${this.apiKey}`;
    }

    try {
      if (!(options.headers as Record<string, string>)['Content-Type']) {
        (options.headers as Record<string, string>)['Content-Type'] =
          'application/json';
      }
      const response = await fetch(url, options);
      const resp = await response.json();
      return resp as T;
    } catch (error) {
      throw new Error(String(error));
    }
  }
}
