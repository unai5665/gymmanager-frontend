import { apiGet, apiPost, apiPut, apiDelete } from './api'

export const getFavoritas    = ()             => apiGet('/rutinas-favoritas')
export const createFavorita  = (data)         => apiPost('/rutinas-favoritas', data)
export const updateFavorita  = (id, data)     => apiPut(`/rutinas-favoritas/${id}`, data)
export const deleteFavorita  = (id)           => apiDelete(`/rutinas-favoritas/${id}`)
export function aplicarFavorita(id, semanas, clienteId = null) {
  const body = { semanas }
  if (clienteId) body.target_cliente_id = clienteId
  return apiPost(`/rutinas-favoritas/${id}/aplicar`, body)
}
