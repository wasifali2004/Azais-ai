// Must run before anything else is imported: modules like AuthModule read
// process.env at import time (e.g. JwtModule.register()), which happens
// before ConfigModule.forRoot() would otherwise load .env.
import "dotenv/config";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";

/**
 * FRONTEND_URL silently falls back to "http://localhost:3000" everywhere
 * it's used (OAuth callback, billing redirects) — in production that
 * fallback sends every signed-in user's browser to localhost instead of a
 * broken-looking error, which is much harder to notice. Fail loudly at
 * boot instead.
 *
 * NODE_ENV=production isn't guaranteed to be set by every host (Railway's
 * Nixpacks builder doesn't set it automatically), so also treat any
 * RAILWAY_* variable — which Railway injects into every deployment
 * regardless of NODE_ENV — as proof this isn't a local dev run.
 */
function assertFrontendUrlConfigured() {
  const isDeployed =
    process.env.NODE_ENV === "production" ||
    Object.keys(process.env).some((key) => key.startsWith("RAILWAY_"));

  if (isDeployed && !process.env.FRONTEND_URL) {
    // eslint-disable-next-line no-console
    console.error(
      "FATAL: FRONTEND_URL is not set on this deployment. This would " +
        "silently redirect signed-in users (Google OAuth, billing " +
        "checkout) to http://localhost:3000 instead of your real frontend " +
        "URL. Set FRONTEND_URL to your deployed frontend's URL on THIS " +
        "backend service specifically (not the frontend service) and redeploy.",
    );
    process.exit(1);
  }
}

async function bootstrap() {
  assertFrontendUrlConfigured();

  // rawBody: true so the Polar webhook handler can verify the request
  // signature against the exact bytes Polar sent (req.rawBody), not a
  // re-serialized copy of the parsed JSON.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use(helmet());

  const allowedOrigins = (
    process.env.CORS_ORIGIN ?? "http://localhost:3000"
  )
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
}

bootstrap();
