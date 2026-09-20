const API = `${import.meta.env.VITE_API_URL || "https://circleup-backend-2.onrender.com"}/api`;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

async function getCsrfToken() {
  await fetch(`${API}/csrftoken/`, {
    method: "GET",
    credentials: "include",
  });

  return getCookie("csrftoken");
}

export async function login(username, password) {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`${API}/signin/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken || "",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}

export async function checkAuth() {
  await getCsrfToken();
  const response = await fetch(`${API}/check/`, {
    method: "GET",
    credentials: "include",
  });

  return response.ok;
}
