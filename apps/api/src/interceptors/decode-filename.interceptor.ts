import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class DecodeFilenameInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // Xử lý file đơn lẻ
    if (request.file && request.file.originalname) {
      request.file.originalname = this.decodeFilename(request.file.originalname);
    }

    // Xử lý mảng file
    if (request.files) {
      // Trường hợp request.files là object (nhiều field) hoặc array
      if (Array.isArray(request.files)) {
        request.files.forEach(file => {
          if (file.originalname) {
            file.originalname = this.decodeFilename(file.originalname);
          }
        });
      } else {
        Object.values(request.files).forEach((fileOrArray: any) => {
          if (Array.isArray(fileOrArray)) {
            fileOrArray.forEach(file => {
              if (file.originalname) {
                file.originalname = this.decodeFilename(file.originalname);
              }
            });
          } else if (fileOrArray?.originalname) {
            fileOrArray.originalname = this.decodeFilename(fileOrArray.originalname);
          }
        });
      }
    }

    return next.handle();
  }

  private decodeFilename(filename: string): string {
    return Buffer.from(filename, 'latin1').toString('utf8');
  }
}
