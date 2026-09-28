import { cloudinary } from "../config/cloudinary";
import type { UploadApiResponse } from "cloudinary";

export const uploadImageBuffer = (buffer: Buffer, folder: string): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload thất bại"));
          return;
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};
