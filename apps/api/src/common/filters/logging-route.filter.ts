import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch()
export class LoggingRouteFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const method = request.method.padEnd(6, ' '); 
    const url = request.url;
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

    let statusColor = 'white';
    if (status >= 500) statusColor = 'red';
    else if (status >= 400) statusColor = 'yellow';

    console.log(
      `${this.color('cyan', `[${timestamp}]`)} ${this.color('red', '[Exception]')} ${this.color('green', method)} ${url} -> ${this.color(statusColor, status.toString())}`,
    );

    response.status(status).json({
      statusCode: status,
      message: exception.message || 'Internal Server Error',
      timestamp,
      path: request.url,
    });
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
