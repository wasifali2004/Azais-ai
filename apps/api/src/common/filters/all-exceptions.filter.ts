import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

/**
 * Catches every exception app-wide. Known HttpExceptions (thrown deliberately
 * with a safe message, e.g. `new BadRequestException('...')`) pass their
 * status + message through to the client unchanged. Anything else — a raw
 * Error, a driver exception, a bug — is logged with full detail server-side
 * and replaced with a generic message, so stack traces and internal details
 * never reach a response body.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          `${request.method} ${request.url} -> ${status}`,
          exception.stack,
        );
      }

      response.status(status).json(
        typeof payload === "string"
          ? { statusCode: status, message: payload }
          : payload,
      );
      return;
    }

    this.logger.error(
      `${request.method} ${request.url} -> unhandled exception`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
}
