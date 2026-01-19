/**
 * Configuração do Cloudinary
 *
 * As credenciais devem ser configuradas via variáveis de ambiente
 * para segurança.
 */

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  folder?: string;
}

/**
 * Obtém a configuração do Cloudinary das variáveis de ambiente
 */
export function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "";
  const folder = process.env.CLOUDINARY_FOLDER || "transactions";

  return {
    cloudName,
    uploadPreset,
    folder,
  };
}

/**
 * Verifica se o Cloudinary está configurado
 */
export function isCloudinaryConfigured(): boolean {
  const config = getCloudinaryConfig();
  return !!(config.cloudName && config.uploadPreset);
}
