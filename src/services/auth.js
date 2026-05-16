import { apiPost, apiGet } from './api'
import { useAuthStore } from '../stores/auth'

export async function login(email, password) {
  const data = await apiPost('/login', { email, password })
  const authStore = useAuthStore()
  authStore.setAuth({ user: data.usuario, token: data.token })
  return data
}

export async function logout() {
  try {
    await apiPost('/logout')
  } finally {
    const authStore = useAuthStore()
    authStore.clearAuth()
  }
}

export async function getCurrentUser() {
  return apiGet('/usuario')
}

export async function forgotPassword(email) {
  return apiPost('/contrasena/recuperar', { email })
}

export async function setupPassword(token, email, password) {
  return apiPost('/contrasena/establecer', {
    token,
    email,
    password,
    password_confirmation: password,
  })
}
