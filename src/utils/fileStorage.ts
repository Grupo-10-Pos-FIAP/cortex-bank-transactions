/**
 * Armazenamento temporário de arquivos no frontend
 * 
 * Este serviço é desacoplado para facilitar migração futura.
 * Atualmente salva arquivos temporariamente no navegador (IndexedDB ou localStorage).
 * 
 * Para migrar para outro serviço (ex: S3, Cloudinary), basta substituir
 * a implementação desta função mantendo a mesma interface.
 */

interface StoredFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  data: string; // base64 ou blob URL
  timestamp: number;
}

const STORAGE_KEY = "temp_files";
const MAX_STORAGE_SIZE = 10 * 1024 * 1024; // 10MB máximo no localStorage

/**
 * Armazena um arquivo temporariamente
 */
export async function storeFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Arquivo não fornecido"));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const fileId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const result = reader.result as string;

        if (file.size < 5 * 1024 * 1024) {
          const storedFiles = getStoredFiles();
          
          const fileData: StoredFile = {
            id: fileId,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type || "application/octet-stream",
            data: result,
            timestamp: Date.now(),
          };

          storedFiles[fileId] = fileData;
          
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(storedFiles));
            resolve(fileId);
          } catch (error) {
            const objectUrl = URL.createObjectURL(file);
            resolve(objectUrl);
          }
        } else {
          const objectUrl = URL.createObjectURL(file);
          resolve(objectUrl);
        }
      } catch (error) {
        reject(new Error("Erro ao armazenar arquivo"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Erro ao ler o arquivo"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Recupera um arquivo armazenado
 */
export function getStoredFile(fileId: string): StoredFile | null {
  try {
    const storedFiles = getStoredFiles();
    return storedFiles[fileId] || null;
  } catch (error) {
    return null;
  }
}

/**
 * Remove um arquivo armazenado
 */
export function removeStoredFile(fileId: string): void {
  try {
    const storedFiles = getStoredFiles();
    delete storedFiles[fileId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedFiles));
  } catch (error) {
  }
}

/**
 * Limpa arquivos antigos (mais de 24 horas)
 */
export function cleanOldFiles(): void {
  try {
    const storedFiles = getStoredFiles();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    Object.keys(storedFiles).forEach((id) => {
      const file = storedFiles[id];
      if (now - file.timestamp > oneDay) {
        delete storedFiles[id];
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedFiles));
  } catch (error) {
  }
}

/**
 * Obtém todos os arquivos armazenados
 */
function getStoredFiles(): Record<string, StoredFile> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    return {};
  }
}

