import { apiPost, apiGet, setToken, removeToken } from './api'
import { useAuthStore } from '../stores/auth'

export async function login(email, password) {
  const data = await apiPost('/login', { email, password })
  const authStore = useAuthStore()
  authStore.setAuth({ user: data.user, token: data.token })
  return data
}

export function logout() {
  const authStore = useAuthStore()
  authStore.clearAuth()
}

export async function getCurrentUser() {
  return apiGet('/me')
}

export async function refreshToken() {
  return apiPost('/refresh-token')
}

export async function forgotPassword(email) {
  return apiPost('/forgot-password', { email })
}

export async function setupPassword(token, password) {
  return apiPost('/setup-password', { token, password })
}
