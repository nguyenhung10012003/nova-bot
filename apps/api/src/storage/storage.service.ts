import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import fs from 'fs';
import path from 'path';
import {v7 as uuidv7} from 'uuid';

export interface SaveFileOptions {
  path?: string;
  fileName?: string;
}

export interface GetFileOptions extends SaveFileOptions {
  fileName: string;
  transform?: <T = any>(file: Buffer) => T; 
}

export interface DeleteFileOptions extends SaveFileOptions {
  fileName: string;
}

@Injectable() 
export class StorageService {
  private readonly baseStoragePath: string;
  constructor(private readonly configService: ConfigService) {
    this.baseStoragePath = this.configService.get('fileStoragePath');
  }

  async getFile(options: GetFileOptions) {
    const filePath = path.join(this.baseStoragePath, options.path || '/', options.fileName);
    const fileBuffer = await fs.promises.readFile(filePath);
    return options.transform ? options.transform(fileBuffer) : fileBuffer;
  }

  async saveFile(file: Express.Multer.File, options: SaveFileOptions = {path: '/'}) {
    const uuid = uuidv7();
    const fileName = `${uuid}-${options.fileName || file.originalname}`;
    const uploadPath = path.join(this.baseStoragePath, options.path, fileName);

    await fs.promises.mkdir(path.dirname(uploadPath), { recursive: true });
    await fs.promises.writeFile(uploadPath, file.buffer);

    const fileUrl = `STORAGE::${options.path}/${fileName}`;
    return fileUrl;
  }

  async deleteFile(options: DeleteFileOptions) {
    const filePath = path.join(this.baseStoragePath, options.path || '/', options.fileName);
    await fs.promises.unlink(filePath);

    return true;
  }
}