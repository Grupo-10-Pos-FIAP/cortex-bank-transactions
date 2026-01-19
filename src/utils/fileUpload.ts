import { uploadToCloudinary } from "./cloudinaryUpload";
import { getCloudinaryConfig } from "@/config/cloudinary.config";

export interface FileUploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export async function uploadFile(file: File): Promise<FileUploadResult> {
  if (!file) {
    throw new Error("Arquivo não fornecido");
  }

  try {
    const config = getCloudinaryConfig();

    if (!config.cloudName || !config.uploadPreset) {
      const tempUrl = `temp://${Date.now()}-${file.name}`;
      return {
        url: tempUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      };
    }

    return await uploadToCloudinary(file, config.cloudName, config.uploadPreset);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Erro ao fazer upload do arquivo");
  }
}

export function validateFile(file: File, maxSizeInMB: number = 5): boolean {
  if (!file) {
    return false;
  }

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return false;
  }

  return true;
}
