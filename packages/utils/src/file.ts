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
