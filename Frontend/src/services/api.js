import { auth } from "../firebase/firebase";

const API_URL = "http://localhost:3000";

export async function apiFetch(endpoint, options = {}) {
  const currentUser = auth.currentUser;
  const token = currentUser ? await currentUser.getIdToken() : null;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Błąd żądania");
  }

  return response.json();
}
