import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
        refetchInterval: false,
        throwOnError: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

function getSharedQueryClient(): QueryClient | null {
  if (typeof window !== "undefined" && (window as any).__REACT_QUERY_CLIENT__) {
    const sharedClient = (window as any).__REACT_QUERY_CLIENT__;
    if (sharedClient && typeof sharedClient.invalidateQueries === "function") {
      return sharedClient;
    }
    delete (window as any).__REACT_QUERY_CLIENT__;
  }
  return null;
}

function setSharedQueryClient(client: QueryClient): void {
  if (typeof window !== "undefined") {
    (window as any).__REACT_QUERY_CLIENT__ = client;
  }
}

let queryClientInstance: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  const sharedClient = getSharedQueryClient();
  if (sharedClient) {
    queryClientInstance = sharedClient;
    return sharedClient;
  }

  if (!queryClientInstance) {
    queryClientInstance = createQueryClient();
    setSharedQueryClient(queryClientInstance);
  }
  return queryClientInstance;
}
