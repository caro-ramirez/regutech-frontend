export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function authHeaders() {
  const token = localStorage.getItem("regutech_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function manejarRespuesta(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Error de red.");
  }
  return data;
}

export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`, { headers: authHeaders() });
  return manejarRespuesta(res);
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return manejarRespuesta(res);
}

export async function apiPatch(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return manejarRespuesta(res);
}

export async function apiPut(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return manejarRespuesta(res);
}

export async function apiDelete(path) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return manejarRespuesta(res);
}
