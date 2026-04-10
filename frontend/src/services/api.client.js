// services/api.client.js
// Cliente HTTP base. Todas las llamadas al backend pasan por aquí.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    // Solo poner Content-Type para JSON; para FormData el browser lo pone solo
    headers: isFormData
      ? {}
      : { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options,
    body: isFormData
      ? options.body
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.error ?? `Error ${res.status}`, res.status);
  }

  return data;
}

export const api = {
  get:       (path)              => request(path),
  post:      (path, body)        => request(path, { method: 'POST',   body }),
  patch:     (path, body)        => request(path, { method: 'PATCH',  body }),
  delete:    (path)              => request(path, { method: 'DELETE' }),
  // Para subir archivos: body debe ser un FormData
  upload:    (path, formData)    => request(path, { method: 'POST',   body: formData }),
};
