/**
 * Serviço de upload de arquivos
 * 
 * Este serviço é desacoplado para facilitar migração futura.
 * Atualmente usa Cloudinary para upload de arquivos.
 * 
 * Para migrar para outro serviço (ex: S3, outro storage), basta substituir
 * a implementação desta função mantendo a mesma interface.
 */

import { uploadToCloudinary } from "./cloudinaryUpload";
import { getCloudinaryConfig } from "@/config/cloudinary.config";

export interface FileUploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Faz upload de um arquivo para o Cloudinary
 * 
 * @param file Arquivo a ser enviado
 * @returns Promise com a URL do arquivo e metadados
 */
export async function uploadFile(file: File): Promise<FileUploadResult> {
  if (!file) {
    throw new Error("Arquivo não fornecido");
  }

  try {
    const config = getCloudinaryConfig();
    
    if (!config.cloudName || !config.uploadPreset) {
      // Se Cloudinary não estiver configurado, retorna uma URL temporária
      // sem fazer upload (compatibilidade com desenvolvimento)
      const tempUrl = `temp://${Date.now()}-${file.name}`;
      return {
        url: tempUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      };
    }

    // Faz upload para o Cloudinary
    return await uploadToCloudinary(
      file,
      config.cloudName,
      config.uploadPreset
    );
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Erro ao fazer upload do arquivo"
    );
  }
}

/**
 * Valida se o arquivo é válido
 * 
 * @param file Arquivo a ser validado
 * @param maxSizeInMB Tamanho máximo em MB (padrão: 5MB)
 * @returns true se válido, false caso contrário
 */
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

/**
 * Obtém a extensão do arquivo
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Verifica se o tipo de arquivo é permitido
 */
export function isAllowedFileType(fileName: string, allowedTypes: string[]): boolean {
  const extension = getFileExtension(fileName);
  return allowedTypes.includes(extension);
}

