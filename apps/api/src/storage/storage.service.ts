import { Injectable, Logger } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly configured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  /** Uploads a buffer to Cloudinary under `key` and returns its public (secure) URL. */
  async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string> {
    if (!this.configured) {
      throw new Error(
        "Cloudinary is not configured (CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET)",
      );
    }

    const resourceType = contentType.startsWith("video/") ? "video" : "image";

    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { public_id: key, resource_type: resourceType, overwrite: true },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload returned no result"));
            return;
          }
          this.logger.log(`Uploaded ${key} (${buffer.byteLength} bytes) to Cloudinary`);
          resolve(result.secure_url);
        },
      );
      uploadStream.end(buffer);
    });
  }
}
