// Base URL for all API calls.
// In dev (npm run dev) this is empty and Vite's proxy handles /api → localhost:5080.
// For the Android APK build, set VITE_API_URL in .env.production to your server's
// real address, e.g.:  VITE_API_URL=http://192.168.1.10:5080
const API_BASE: string = (import.meta as any).env?.VITE_API_URL ?? '';

export function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, options);
}
