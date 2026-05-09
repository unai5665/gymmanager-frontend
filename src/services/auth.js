import { apiGet, apiPost, setToken, removeToken } from './api'

export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user))
}

export function getUser() {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export async function login(email, password) {
  const data = await apiPost('/login', {
    email,
    password
  })

  if (data.token) setToken(data.token)
  if (data.user) setUser(data.user)

  return data
}

export async function register(userData) {
  const data = await apiPost('/register', userData)

  if (data.token) setToken(data.token)
  if (data.user) setUser(data.user)

  return data
}

export function logout() {
  removeToken()
  localStorage.removeItem('user')
  window.location.href = '/login'
}

export async function forgotPassword(email) {
  return await apiPost('/forgotpassword', { email })
}

export async function resetPassword(payload) {
  return await apiPost('/resetpassword', payload)
}

