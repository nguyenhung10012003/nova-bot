import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable()
export class LogRequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const method = request.method.padEnd(6, ' '); // Căn chỉnh method
    const url = request.url;
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0]; // Format timestamp

    console.log(
      `${this.color('cyan', `[${timestamp}]`)} ${this.color('magenta', '[Request]')} ${this.color('green', method)} ${url}`,
    );

    return next.handle().pipe(
      tap(() => {
        this.logResponse(
          response.statusCode,
          method,
          url,
          startTime,
          timestamp,
        );
      }),
      catchError((err) => {
        this.logResponse(err.status || 500, method, url, startTime, timestamp);
        return throwError(() => err);
      }),
    );
  }

  private logResponse(
    statusCode: number,
    method: string,
    url: string,
    startTime: number,
    timestamp: string,
  ) {
    const endTime = Date.now();
    const duration = (endTime - startTime).toString().padEnd(3, ' '); // Định dạng thời gian

    let statusColor = 'white';
    if (statusCode >= 500)
      statusColor = 'red'; // Lỗi server
    else if (statusCode >= 400)
      statusColor = 'yellow'; // Lỗi client
    else if (statusCode >= 300)
      statusColor = 'blue'; // Redirect
    else if (statusCode >= 200) statusColor = 'green'; // Thành công

    console.log(
      `${this.color('cyan', `[${timestamp}]`)} ${this.color('magenta', '[Response]')} ${this.color('green', method)} ${url} -> ${this.color(statusColor, statusCode.toString())} ${this.color('gray', `(${duration}ms)`)}`,
    );
  }

  private color(color: string, text: string): string {
    const colors: Record<string, string> = {
      reset: '\x1b[0m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      gray: '\x1b[90m',
    };
    return `${colors[color] || colors.white}${text}${colors.reset}`;
  }
}
