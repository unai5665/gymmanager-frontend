import { apiGet, apiPost, apiPut, apiDelete, apiDownload } from './api'

export function getOrganizaciones(params = {}) {
  const q = new URLSearchParams(params).toString()
  return apiGet(`/organizaciones${q ? '?' + q : ''}`)
}

export function createOrganizacion(data) {
  return apiPost('/organizaciones', data)
}

export function updateOrganizacion(id, data) {
  return apiPut(`/organizaciones/${id}`, data)
}

export function deleteOrganizacion(id) {
  return apiDelete(`/organizaciones/${id}`)
}

export function exportarOrganizaciones(params = {}) {
  const q = new URLSearchParams(params).toString()
  return apiDownload(`/informes/organizaciones${q ? '?' + q : ''}`)
}
