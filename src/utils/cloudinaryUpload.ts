/**
 * Serviço de upload para Cloudinary
 *
 * Este serviço é desacoplado e pode ser facilmente substituído.
 * Mantém a mesma interface do fileUpload.ts
 */

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
 * @param cloudName Nome da conta Cloudinary
 * @param uploadPreset Preset de upload (pode ser unsigned)
 * @returns Promise com a URL do arquivo e metadados
 */
export async function uploadToCloudinary(
  file: File,
  cloudName: string,
  uploadPreset: string
): Promise<FileUploadResult> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Arquivo não fornecido"));
      return;
    }

    if (!cloudName || !uploadPreset) {
      reject(new Error("Credenciais do Cloudinary não configuradas"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const folder = process.env.CLOUDINARY_FOLDER || "transactions";
    formData.append("folder", folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

    fetch(uploadUrl, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Erro no upload: ${response.status} - ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        resolve({
          url: data.secure_url || data.url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || data.format || "application/octet-stream",
        });
      })
      .catch((error) => {
        reject(
          new Error(error instanceof Error ? error.message : "Erro ao fazer upload para Cloudinary")
        );
      });
  });
}
