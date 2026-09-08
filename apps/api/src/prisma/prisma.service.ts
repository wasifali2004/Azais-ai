import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // TEMPORARY: Supabase's pooled connection (DATABASE_URL, pgbouncer
    // transaction mode on :6543) is currently refusing every connection
    // after the first — confirmed by testing DATABASE_URL vs DIRECT_URL
    // side by side, only DATABASE_URL times out. Using the direct connection
    // (DIRECT_URL, straight to Postgres on :5432) instead until the pooler
    // itself recovers. This is fine for a single local dev process; it is
    // NOT fine for many concurrent serverless instances in production, since
    // each holds a real Postgres backend connection instead of sharing the
    // pooler's multiplexed ones — switch back to DATABASE_URL there once the
    // pooler is healthy again.
    //
    // Supabase's pooler also closes connections that sit idle for a while.
    // Left to its own defaults, `pg.Pool` can hand out a connection it still
    // considers alive that the server already dropped — the next query on it
    // fails with "Server has closed the connection". Keeping
    // `idleTimeoutMillis` well under the pooler's own timeout means pg
    // recycles connections proactively instead of handing out stale ones —
    // worth keeping even on the direct connection as cheap insurance.
    const pool = new Pool({
      connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 10_000,
      keepAlive: true,
    });
    // node-postgres emits 'error' on a pool client killed by the server while
    // idle (no query in flight to reject) — without a listener that's an
    // unhandled error and crashes the process instead of just discarding the
    // dead client.
    const logger = new Logger(PrismaService.name);
    pool.on("error", (err) => logger.error(`Postgres pool error: ${err.message}`));

    super({ adapter: new PrismaPg(pool) });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log("Connected to database");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
