import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';
import path from 'path';
import { downloadFileFromUrl, getFileMetadata } from 'src/utils/file';
import { v7 as uuidv7 } from 'uuid';

export interface SaveFileOptions {
  path?: string;
  fileName?: string;
  validation?: SaveFileValidation;
}

export interface SaveFileValidation {
  maxSize?: number;
  allowedMimeTypes?: string[];
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
    const filePath = path.join(
      this.baseStoragePath,
      options.path || '/',
      options.fileName,
    );
    const fileBuffer = await fs.promises.readFile(filePath);
    return options.transform ? options.transform(fileBuffer) : fileBuffer;
  }

  async saveFile(
    file: Express.Multer.File | string,
    options: SaveFileOptions = { path: '/' },
  ) {
    if (typeof file === 'string') {
      if (options.validation) {
        const isValid = await this.validateFileMetadata(
          file,
          options.validation,
        );
        if (!isValid) {
          return null;
        }
      }
      const dirPath = path.join(this.baseStoragePath, options.path || '');
      const fileExtension = path.extname(file);
      const fileName = `${uuidv7()}${fileExtension}`;

      await downloadFileFromUrl(file, { dirPath, name: fileName });
      return `STORAGE::${options.path || ''}/${fileName}`;
    }
    const uuid = uuidv7();
    const fileName = `${uuid}-${options.fileName || file.originalname}`;
    const uploadPath = path.join(this.baseStoragePath, options.path, fileName);

    await fs.promises.mkdir(path.dirname(uploadPath), { recursive: true });
    await fs.promises.writeFile(uploadPath, file.buffer);

    const fileUrl = `STORAGE::${options.path}/${fileName}`;
    return fileUrl;
  }

  async deleteFile(options: DeleteFileOptions) {
    const filePath = path.join(
      this.baseStoragePath,
      options.path || '/',
      options.fileName,
    );
    await fs.promises.unlink(filePath);

    return true;
  }

  async validateFileMetadata(url: string, validation: SaveFileValidation) {
    try {
      const metadata = await getFileMetadata(url);
      if (!metadata) {
        return false;
      } else {
        if (
          validation.maxSize &&
          (metadata.contentLength === 'Unknown' ||
            Number(metadata.contentLength) > validation.maxSize)
        ) {
          return false;
        }
        if (
          validation.allowedMimeTypes &&
          !validation.allowedMimeTypes.includes(metadata.contentType)
        ) {
          return false;
        }
      }
      return true;
    } catch (_error) {
      return false;
    }
  }
}
