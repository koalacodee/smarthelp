import { Upload } from "tus-js-client";
import ky from "ky";
interface TusUploadOptions {
  onError?: (error: any) => void;
  onProgress?: (bytesUploaded: number, bytesTotal: number) => void;
  onSuccess?: () => void;
  onChunkComplete?: (
    chunkSize: number,
    bytesAccepted: number,
    bytesTotal: number
  ) => void;
  onBeforeRequest?: (req: any) => void;
  onAfterResponse?: (req: any, res: any) => void;
  file: File;
  uploadKey: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export class TusService {
  private _uploadUrl: string;
  private _maximumRoundtrip: number;
  private _minimumChunkSize: number;
  private _maximumChunkSize: number;
  constructor(
    uploadUrl: string,
    maximumRoundtrip: number = 1000,
    minimumChunkSize: number = 512 * 1024,
    maximumChunkSize: number = 50 * 1024 * 1024
  ) {
    this._uploadUrl = uploadUrl;
    this._maximumRoundtrip = maximumRoundtrip;
    this._minimumChunkSize = minimumChunkSize;
    this._maximumChunkSize = maximumChunkSize;
  }

  async upload(options: TusUploadOptions) {
    const chunkSize = Math.min(
      Math.max(
        this._minimumChunkSize,
        options.file.size / this._maximumRoundtrip
      ),
      this._maximumChunkSize
    );

    const upload = new Upload(options.file, {
      endpoint: this._uploadUrl,
      chunkSize: chunkSize,
      retryDelays: [0, 1000, 3000, 5000],
      metadata: {
        originalFilename: options.file.name,
        uploadKey: options.uploadKey,
        ...(options.metadata
          ? Object.entries(options.metadata).reduce<Record<string, string>>(
              (acc, [key, value]) => {
                if (value === undefined || value === null) return acc;
                acc[key] =
                  typeof value === "boolean"
                    ? value
                      ? "1"
                      : "0"
                    : String(value);
                return acc;
              },
              {}
            )
          : {}),
      },
      onError: function (error) {
        options.onError?.(error);
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        options.onProgress?.(bytesUploaded, bytesTotal);
      },
      onSuccess: function () {
        options.onSuccess?.();
      },
      onChunkComplete: function (chunkSize, bytesAccepted, bytesTotal) {
        options.onChunkComplete?.(chunkSize, bytesAccepted, bytesTotal);
      },
      onBeforeRequest: function (req) {
        options.onBeforeRequest?.(req);
      },
      onAfterResponse: function (req, res) {
        options.onAfterResponse?.(req, res);
      },
    });
    return upload;
  }

  async lockUploadKey(uploadKey: string) {
    const response = await ky.post(`${this._uploadUrl}/lock`, {
      headers: {
        "Upload-Key": uploadKey,
      },
    });
    return response.json();
  }
}
