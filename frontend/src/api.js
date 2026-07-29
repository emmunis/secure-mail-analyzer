export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5108/api";

export function apiFetch(path, options = {}) {
  return fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...options.headers,
    },
  });
}
