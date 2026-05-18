import { apiGet, apiPost } from './api'

export const getDashboard  = () => apiGet('/dashboard')
export const markAttendance = () => apiPost('/asistencia', {})
