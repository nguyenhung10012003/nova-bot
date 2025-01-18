import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export const DEFAULT_CHUNK_SIZE = 1000;
export const DEFAULT_CHUNK_OVERLAP = 100;

export type ChunkOptions = {
  chunkSize?: number;
  chunkOverlap?: number;
  separators?: string[];
};

const chunk = (
  docs: Document[],
  options: ChunkOptions = {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  },
) => {
  const splitter = new RecursiveCharacterTextSplitter(options);

  return splitter.splitDocuments(docs);
};

export { chunk };
