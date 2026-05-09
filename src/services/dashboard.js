import { apiGet, apiPost } from './api'

export function getDashboard() {
  return apiGet('/dashboard')
}

export function marcarAsistencia(completado) {
  return apiPost('/asistencia', {
    completado
  })
}