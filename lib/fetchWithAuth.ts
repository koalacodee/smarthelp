// utils/fetchWithAuth.ts

export async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit = {},
  options?: { accessToken?: string; cookies?: string }
): Promise<Response> {
  const { accessToken, cookies } = options || {};

  const headers: HeadersInit = {
    ...(init.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(cookies ? { cookie: cookies } : {}),
  };

  let response = await fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });

  // Retry on 401 (skip if it's refresh endpoint)
  if (response.status === 401 && !input.toString().includes("/auth/refresh")) {
    try {
      const refreshResponse = await fetch("/auth/refresh", {
        method: "POST",
        headers: { cookie: cookies || "" },
        credentials: "include",
      });

      if (!refreshResponse.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await refreshResponse.json();
      const newAccessToken = data?.data?.accessToken;

      // Retry original request with new token
      const retryHeaders: HeadersInit = {
        ...(init.headers || {}),
        ...(newAccessToken
          ? { Authorization: `Bearer ${newAccessToken}` }
          : {}),
        ...(cookies ? { cookie: cookies } : {}),
      };

      response = await fetch(input, {
        ...init,
        headers: retryHeaders,
        credentials: "include",
      });
    } catch (refreshError) {
      console.error("Refresh token failed", refreshError);
      throw refreshError;
    }
  }

  return response;
}
