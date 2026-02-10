// Lightweight API helper for the MikroTik Hotspot Manager backend.
// Uses Vite env `VITE_API_BASE_URL` and optional `VITE_API_KEY` for Authorization.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_PREFIX = '/make-server-4f18e215';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  } as Record<string, string>;

  // If a VITE_API_KEY is provided on the hosting environment, include it.
  const apiKey = import.meta.env.VITE_API_KEY;
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const response = await fetch(`${API_BASE_URL}${API_PREFIX}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${errorText}`);
  }

  return response.json();
}
