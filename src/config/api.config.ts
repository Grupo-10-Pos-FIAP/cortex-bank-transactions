export function shouldUseMock(): boolean {
  const useMock = process.env.USE_MOCK;
  return useMock === "true" || useMock === "1" || (useMock !== undefined && useMock !== "");
}

export function getApiBaseUrl(): string {
  if (shouldUseMock()) {
    return process.env.MOCK_API_BASE_URL || "http://localhost:8080";
  }
  return process.env.API_BASE_URL || "http://localhost:8080";
}
