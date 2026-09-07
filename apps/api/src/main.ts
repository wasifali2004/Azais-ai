// Must run before anything else is imported: modules like AuthModule read
// process.env at import time (e.g. JwtModule.register()), which happens
// before ConfigModule.forRoot() would otherwise load .env.
import "dotenv/config";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  // rawBody: true so the Polar webhook handler can verify the request
  // signature against the exact bytes Polar sent (req.rawBody), not a
  // re-serialized copy of the parsed JSON.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use(helmet());

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
}

bootstrap();
