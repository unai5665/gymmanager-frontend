import { apiGet, apiPost, apiPut, apiDelete } from './api'

export function getRutina(semana, clienteId) {
  const params = { semana }
  if (clienteId) params.cliente_id = clienteId
  return apiGet('/rutinas-semanales?' + new URLSearchParams(params))
}

export const updateRutina       = (id, dias) => apiPut(`/rutinas-semanales/${id}`, { dias })
export const deleteRutina       = (id)       => apiDelete(`/rutinas-semanales/${id}`)
export const getGruposMusculares = ()              => apiGet('/grupos-musculares')
export const getEjercicios       = ()              => apiGet('/ejercicios')
export const getRutinaRango      = (desde, hasta)  => apiGet(`/rutinas-semanales/rango?desde=${desde}&hasta=${hasta}`)
