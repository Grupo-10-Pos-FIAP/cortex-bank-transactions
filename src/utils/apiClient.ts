import { withRetry } from "./errorHandler";
import { getApiBaseUrl } from "@/config/api.config";

const API_BASE_URL = getApiBaseUrl();
const REQUEST_TIMEOUT = 30000;

function getAuthToken(): string | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage.getItem("token");
  }
  return null;
}

interface TimeoutAbortController extends AbortController {
  timeoutId?: NodeJS.Timeout;
}

function createTimeoutController(timeout: number): TimeoutAbortController {
  const controller = new AbortController() as TimeoutAbortController;
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);
  controller.timeoutId = timeoutId;
  return controller;
}

export async function fetchApi(
  url: string,
  options: RequestInit & { retry?: boolean; timeout?: number } = {}
): Promise<Response> {
  const { retry = true, timeout = REQUEST_TIMEOUT, ...fetchOptions } = options;

  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const performFetch = async (): Promise<Response> => {
    const timeoutController = createTimeoutController(timeout);

    let signal = timeoutController.signal;
    if (fetchOptions.signal) {
      const combinedController = new AbortController();
      const abort = () => {
        if (timeoutController.timeoutId) {
          clearTimeout(timeoutController.timeoutId);
        }
        combinedController.abort();
      };
      timeoutController.signal.addEventListener("abort", abort);
      fetchOptions.signal.addEventListener("abort", abort);
      signal = combinedController.signal;
    }

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${url}`, {
        ...fetchOptions,
        headers,
        signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("timeout: A requisição demorou muito para responder");
      }
      throw error;
    }

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.removeItem("token");
          window.location.href = "/auth";
        }
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`Erro na requisição: ${response.status} ${errorText}`);
      }
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Erro na requisição: ${response.status} ${errorText}`);
    }

    return response;
  };

  if (retry) {
    return withRetry(performFetch, {
      maxRetries: 3,
      baseDelay: 1000,
    });
  }

  return performFetch();
}
