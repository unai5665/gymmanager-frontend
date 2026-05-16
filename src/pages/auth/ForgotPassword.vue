<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { forgotPassword } from '../../services/auth'

const email = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')
const { t } = useI18n()

async function handleSubmit() {
  loading.value = true
  message.value = ''
  error.value = ''
  try {
    await forgotPassword(email.value)
    message.value = t('forgotPassword.messageSent')
    email.value = ''
  } catch {
    error.value = t('forgotPassword.serverError')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <p class="auth-title">GymManager</p>
      <h1 class="auth-subtitle">{{ t('forgotPassword.title') }}</h1>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>{{ t('forgotPassword.emailPlaceholder') }}</label>
          <input v-model="email" type="email" :placeholder="t('forgotPassword.emailPlaceholder')" required />
        </div>

        <p v-if="error" class="form-error">{{ error }}</p>
        <p v-if="message" class="form-success">{{ message }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? t('forgotPassword.sending') : t('forgotPassword.sendLink') }}
        </button>
      </form>

      <router-link to="/login" class="auth-link">
        {{ t('forgotPassword.backToLogin') }}
      </router-link>
    </div>
  </div>
</template>
