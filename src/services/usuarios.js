import { apiGet, apiPost, apiPut, apiDelete } from './api'

export function getUsuarios(params = {}) {
  const q = new URLSearchParams(params).toString()
  return apiGet(`/usuarios${q ? '?' + q : ''}`)
}

export function getUsuario(id) {
  return apiGet(`/usuarios/${id}`)
}

export function createUsuario(data) {
  return apiPost('/usuarios', data)
}

export function updateUsuario(id, data) {
  return apiPut(`/usuarios/${id}`, data)
}

export function deleteUsuario(id) {
  return apiDelete(`/usuarios/${id}`)
}
