// Cliente HTTP base. Todas las llamadas al backend pasan por aquí.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',   // enviar cookie httpOnly en cada request
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // 204 No Content — devolver null
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.error ?? 'Error desconocido', res.status);
  }

  return data;
}

export const api = {
  get:    (path)         => request(path),
  post:   (path, body)   => request(path, { method: 'POST',   body }),
  patch:  (path, body)   => request(path, { method: 'PATCH',  body }),
  delete: (path)         => request(path, { method: 'DELETE' }),
};

export { ApiError };
