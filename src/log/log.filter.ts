import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LogService } from './log.service';

@Catch()
export class LogExceptionFilter implements ExceptionFilter {
  constructor(@Inject(LogService) private readonly logService: LogService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    // These are used if the exception doesn't match any known type
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let stack = '';

    if (exception instanceof HttpException) {
      // These are errors we threw on purpose using NestJS exceptions
      // e.g. throw new NotFoundException(), throw new UnauthorizedException()
      status = exception.getStatus(); // 400, 401, 404, 409 etc.
      const exceptionResponse = exception.getResponse();
      // getResponse() can return either a plain string or an object like
      // { message: "Email already registered", error: "Conflict", statusCode: 409 }
      // so we handle both shapes to always extract a readable message
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
    } else if (exception instanceof Error) {
      // These are crashes we didn't anticipate
      // e.g. null reference, failed DB connection, JSON parse error
      // Status stays as 500 since something genuinely broke
      message = exception.message;
      stack = exception.stack || ''; // capture stack trace to help with debugging
    }

    // Logs every error regardless of type so we have a full audit trail
    // The stack is only populated for unexpected errors (instanceof Error above)
    await this.logService.createLog({
      message,
      stack,
      context: exception?.constructor?.name || 'UnknownException',
      path: request.url,
      method: request.method,
      statusCode: status,
      metadata: {
        body: request.body,
        query: request.query,
        params: request.params,
      },
    });
    // never expose stack traces or internals to the clien
    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
