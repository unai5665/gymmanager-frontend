import { apiGet } from './api'

export function getAsistencias(params = {}) {
  const q = new URLSearchParams(params).toString()
  return apiGet(`/asistencias${q ? '?' + q : ''}`)
}
