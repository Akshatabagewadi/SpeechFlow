
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api'

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`

    try {
      const body = await response.json()
      message = body.message || message
    } catch {}

    throw new Error(message)
  }

  if (response.status === 204) return null

  return response.json()
}

export const api = {
  list: (search = '') =>
    request(
      `/transcriptions${search ? `?search=${encodeURIComponent(search)}` : ''}`
    ),

  get: id => request(`/transcriptions/${id}`),

  create: data =>
    request('/transcriptions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id, data) =>
    request(`/transcriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  remove: id =>
    request(`/transcriptions/${id}`, {
      method: 'DELETE'
    })
}
