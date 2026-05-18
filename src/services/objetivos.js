import { apiGet, apiPost, apiPut, apiDelete } from './api'

export function getObjetivos(params = {}) {
  const q = new URLSearchParams(params).toString()
  return apiGet(`/objetivos${q ? '?' + q : ''}`)
}

export const createObjetivo = (data)     => apiPost('/objetivos', data)
export const updateObjetivo = (id, data) => apiPut(`/objetivos/${id}`, data)
export const deleteObjetivo = (id)       => apiDelete(`/objetivos/${id}`)
