import { ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Response } from "express";

/**
 * Wraps passport's "google" strategy so a failed exchange (denied consent,
 * expired/invalid code, Google API hiccup) redirects the browser back to the
 * frontend instead of rendering a raw JSON 500 — this route is hit by a
 * top-level browser navigation from Google, not a fetch call, so an error
 * response has nowhere sensible to go except a page.
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  private readonly logger = new Logger(GoogleAuthGuard.name);

  // Must declare its own (even no-op) constructor: without one, Nest infers
  // this class's constructor dependencies from the parent mixin's, which
  // loses the parent's @Optional() on AuthModuleOptions and makes Nest treat
  // it as a required, unresolvable dependency.
  constructor() {
    super();
  }

  handleRequest<TUser = unknown>(
    err: unknown,
    user: unknown,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      // The client only ever sees ?error=google_auth_failed — full detail
      // (the actual passport/Google failure reason) stays server-side here.
      this.logger.error(
        `Google OAuth callback failed: err=${err instanceof Error ? err.stack : String(err)} info=${String(info)}`,
      );
      const res = context.switchToHttp().getResponse<Response>();
      const frontendUrl = (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/\/+$/, "");
      res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
      return null as TUser;
    }
    return user as TUser;
  }
}
