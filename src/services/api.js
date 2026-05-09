const API_URL = 'http://localhost:8000/api'

// 🔐 obtener token
function getToken() {
  return localStorage.getItem('token')
}

// =======================
// GET GENÉRICO
// =======================
export async function apiGet(url) {
  const res = await fetch(`${API_URL}${url}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Accept': 'application/json'
    }
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Error en GET')
  }

  return data
}

// =======================
// POST GENÉRICO
// =======================
export async function apiPost(url, body = {}) {
  const res = await fetch(`${API_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Error en POST')
  }

  return data
}

// =======================
// AUTH HELPERS
// =======================
export function setToken(token) {
  localStorage.setItem('token', token)
}

export function removeToken() {
  localStorage.removeItem('token')
}

export function isAuthenticated() {
  return !!getToken()
}