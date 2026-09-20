export const API = `${import.meta.env.VITE_API_URL || "https://circleup-backend-2.onrender.com"}/api`;
const ACCESS_TOKEN_KEY = "circleup_access_token";
const REFRESH_TOKEN_KEY = "circleup_refresh_token";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("userId");
}

export async function login(username, password) {
  const response = await fetch(`${API}/signin/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  const accessToken = data.access || data.access_token || data.token;
  if (!accessToken) {
    throw new Error("Login succeeded, but the server did not return an access token.");
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (data.refresh || data.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh || data.refresh_token);
  }
  if (data.user_id) localStorage.setItem("userId", data.user_id);
  return data;
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;

  const response = await fetch(`${API}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access) {
    clearTokens();
    return false;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
  return true;
}

export async function checkAuth() {
  const token = getAccessToken();
  if (!token) return false;
  const response = await fetch(`${API}/check/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.ok) return true;
  if (response.status !== 401 || !(await refreshAccessToken())) return false;

  const retry = await fetch(`${API}/check/`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  return retry.ok;
}
