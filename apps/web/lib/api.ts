export type ApiResponse<T> = {
  data: T;
  ok: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const payload = (await response.json()) as ApiResponse<T> | T;

  if (payload && typeof payload === 'object' && 'data' in payload && 'ok' in payload) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
}
