import * as fs from 'fs';
import * as path from 'path';

export function saveDataToFile(data: unknown, fileLocation: string): void {
  const jsonData = JSON.stringify(data, null, 2); 

  const dir = path.dirname(fileLocation);
  if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fileLocation, jsonData, 'utf8');
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
