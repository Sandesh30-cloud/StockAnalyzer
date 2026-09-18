export const BACKEND_UNAVAILABLE_MESSAGE =
  'Backend unavailable. Run: cd backend && python3 -m uvicorn main:app --reload --port 8000'

export const swrFetcher = <T>(url: string): Promise<T> =>
  fetch(url).then((res) => res.json() as Promise<T>)

export async function apiFetch<T>(
  url: string,
  init?: RequestInit
): Promise<{ data: T | null; error: string | null; ok: boolean }> {
  try {
    const response = await fetch(url, init)
    let data: T

    try {
      data = await response.json()
    } catch {
      if (!response.ok) {
        return { data: null, error: BACKEND_UNAVAILABLE_MESSAGE, ok: false }
      }
      return { data: null, error: 'Invalid response from server', ok: false }
    }

    if (!response.ok) {
      return { data: null, error: BACKEND_UNAVAILABLE_MESSAGE, ok: false }
    }

    return { data, error: null, ok: true }
  } catch {
    return { data: null, error: BACKEND_UNAVAILABLE_MESSAGE, ok: false }
  }
}
