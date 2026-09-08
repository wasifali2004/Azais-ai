import { Injectable, Logger } from "@nestjs/common";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "generations";
  private readonly client: SupabaseClient | null;

  constructor() {
    const url = process.env.SUPABASE_URL;
    // The *service role* key, not the anon/public key — uploads go through
    // the server, not a signed-in browser session, so this needs to bypass
    // row-level security on the bucket. Never expose this key to the client.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.client = url && serviceRoleKey ? createClient(url, serviceRoleKey) : null;
  }

  /** Uploads a buffer to the Supabase Storage bucket under `key` and returns its public URL. */
  async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string> {
    if (!this.client) {
      throw new Error("Supabase Storage is not configured (SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY)");
    }

    const { error } = await this.client.storage.from(this.bucket).upload(key, buffer, {
      contentType,
      upsert: true,
    });
    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    this.logger.log(`Uploaded ${key} (${buffer.byteLength} bytes) to Supabase Storage`);
    return this.client.storage.from(this.bucket).getPublicUrl(key).data.publicUrl;
  }
}
