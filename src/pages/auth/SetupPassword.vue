<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setupPassword } from '../../services/auth'

const email = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

async function handleSubmit() {
  if (newPassword.value !== confirmPassword.value) {
    error.value = t('setupPassword.passwordMismatch')
    return
  }
  error.value = ''
  loading.value = true
  try {
    await setupPassword(route.params.token, email.value, newPassword.value)
    router.push('/login')
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
      <h1 class="auth-subtitle">{{ t('setupPassword.title') }}</h1>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>{{ t('login.emailPlaceholder') }}</label>
          <input v-model="email" type="email" :placeholder="t('login.emailPlaceholder')" required />
        </div>
        <div class="form-group">
          <label>{{ t('setupPassword.newPasswordPlaceholder') }}</label>
          <input v-model="newPassword" type="password" :placeholder="t('setupPassword.newPasswordPlaceholder')" required />
        </div>
        <div class="form-group">
          <label>{{ t('setupPassword.confirmPasswordPlaceholder') }}</label>
          <input v-model="confirmPassword" type="password" :placeholder="t('setupPassword.confirmPasswordPlaceholder')" required />
        </div>

        <p v-if="error" class="form-error">{{ error }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? t('common.loading') : t('setupPassword.submitButton') }}
        </button>
      </form>
    </div>
  </div>
</template>
