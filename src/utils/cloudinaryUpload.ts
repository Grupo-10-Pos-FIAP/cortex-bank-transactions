export interface FileUploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

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
