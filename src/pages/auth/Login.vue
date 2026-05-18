<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { login } from '../../services/auth'
import PasswordInput from '../../components/PasswordInput.vue'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const ROLE_ROUTES = {
  superadmin:   '/superadmin/users',
  administrador: '/admin/users',
  entrenador:   '/trainer/clients',
  cliente:      '/client/dashboard',
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
    const route = ROLE_ROUTES[authStore.role] || '/login'
    router.push(route)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <p class="auth-title">GymManager</p>
      <h1 class="auth-subtitle">{{ t('login.title') }}</h1>

      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label>{{ t('login.emailPlaceholder') }}</label>
          <input v-model="email" type="email" :placeholder="t('login.emailPlaceholder')" required />
        </div>
        <div class="form-group">
          <label>{{ t('login.passwordPlaceholder') }}</label>
          <PasswordInput v-model="password" :placeholder="t('login.passwordPlaceholder')" required />
        </div>

        <p v-if="error" class="form-error">{{ error }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? t('common.loading') : t('login.submitButton') }}
        </button>
      </form>

      <router-link to="/forgot-password" class="auth-link">
        {{ t('login.forgotPasswordLink') }}
      </router-link>
    </div>
  </div>
</template>
