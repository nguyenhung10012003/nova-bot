import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { PPTXLoader } from '@langchain/community/document_loaders/fs/pptx';
import {
  JSONLinesLoader,
  JSONLoader
} from 'langchain/document_loaders/fs/json';
import { MultiFileLoader } from 'langchain/document_loaders/fs/multi_file';
import { TextLoader } from 'langchain/document_loaders/fs/text';

const documentLoaderMapping = {
  '.json': (path: string) => new JSONLoader(path),
  '.jsonl': (path: string) => new JSONLinesLoader(path, '/html'),
  '.txt': (path: string) => new TextLoader(path),
  '.md': (path: string) => new TextLoader(path),
  '.csv': (path: string) => new CSVLoader(path),
  '.xlsx': (path: string) => new CSVLoader(path),
  '.xls': (path: string) => new CSVLoader(path),
  '.docx': (path: string) => new DocxLoader(path),
  '.doc': (path: string) => new DocxLoader(path),
  '.pdf': (path: string) => new PDFLoader(path),
  '.pptx': (path: string) => new PPTXLoader(path),
  '.ppt': (path: string) => new PPTXLoader(path)
};

const loadDocs = async (paths: string[]) => {
  const loader = new MultiFileLoader(paths, documentLoaderMapping);
  return loader.load();
};

export { loadDocs };
