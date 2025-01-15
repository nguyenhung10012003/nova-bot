export type Document = {
  pageContent: string;
  metadata: Record<string, any>;
};

export type Tool = {
  tool: string; // Tool name
  toolInput: Record<string, any>; // Tool input
  toolOutput: string; // Tool output
};

export type FileAnnotation = {
  filePath: string;
  fileName: string;
};

export interface ApiClientOptions {
  baseUrl?: string;
  apiKey?: string;
}

