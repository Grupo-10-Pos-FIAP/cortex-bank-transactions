export const ErrorType = {
  NETWORK: "NETWORK",
  TIMEOUT: "TIMEOUT",
  SERVER: "SERVER",
  CLIENT: "CLIENT",
  UNKNOWN: "UNKNOWN",
} as const;

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType];

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  statusCode?: number;
  retryable: boolean;
}

function getClientErrorMessage(statusCode: number): string {
  const errorMessages: Record<number, string> = {
    401: "Não autorizado. Faça login novamente.",
    403: "Acesso negado. Você não tem permissão para esta ação.",
    404: "Recurso não encontrado.",
    429: "Muitas requisições. Aguarde um momento e tente novamente.",
  };

  return errorMessages[statusCode] || "Erro na requisição. Verifique os dados e tente novamente.";
}

function classifyHttpError(error: Error, statusCode: number): AppError {
  if (statusCode >= 500) {
    return {
      type: ErrorType.SERVER,
      message: "Erro no servidor. Tente novamente em alguns instantes.",
      originalError: error,
      statusCode,
      retryable: true,
    };
  }

  if (statusCode >= 400) {
    return {
      type: ErrorType.CLIENT,
      message: getClientErrorMessage(statusCode),
      originalError: error,
      statusCode,
      retryable: false,
    };
  }

  return {
    type: ErrorType.UNKNOWN,
    message: error.message || "Erro desconhecido",
    originalError: error,
    statusCode,
    retryable: false,
  };
}

function extractStatusCode(error: Error): number | undefined {
  const statusMatch = error.message.match(/(\d{3})/);
  return statusMatch ? parseInt(statusMatch[1], 10) : undefined;
}

export function classifyError(error: unknown): AppError {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      type: ErrorType.NETWORK,
      message: "Erro de conexão. Verifique sua internet e tente novamente.",
      originalError: error as Error,
      retryable: true,
    };
  }

  if (error instanceof Error && error.message.includes("timeout")) {
    return {
      type: ErrorType.TIMEOUT,
      message: "A requisição demorou muito para responder. Tente novamente.",
      originalError: error,
      retryable: true,
    };
  }

  if (error instanceof Error && error.message.includes("Erro na requisição")) {
    const statusCode = extractStatusCode(error);
    if (statusCode) {
      return classifyHttpError(error, statusCode);
    }
  }

  return {
    type: ErrorType.UNKNOWN,
    message: error instanceof Error ? error.message : "Erro desconhecido",
    originalError: error instanceof Error ? error : undefined,
    retryable: false,
  };
}

export function waitForRetry(attempt: number, baseDelay = 1000): Promise<void> {
  const delay = baseDelay * Math.pow(2, attempt);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    retryable?: (_error: AppError) => boolean;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, retryable } = options;

  let lastError: AppError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const appError = classifyError(error);

      if (!appError.retryable) {
        throw appError;
      }

      if (retryable && !retryable(appError)) {
        throw appError;
      }

      lastError = appError;

      if (attempt === maxRetries) {
        throw appError;
      }

      await waitForRetry(attempt, baseDelay);
    }
  }

  throw lastError || new Error("Erro desconhecido");
}
