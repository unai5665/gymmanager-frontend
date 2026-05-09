<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const email = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')
const { t } = useI18n()

async function sendResetLink() {
  loading.value = true
  message.value = ''
  error.value = ''

  try {
    const res = await fetch('http://localhost:8000/api/forgotpassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email.value
      })
    })

    const data = await res.json()

    if (!res.ok) {
      error.value = data.message || t('forgotPassword.errorSending')
      return
    }

    message.value = t('forgotPassword.messageSent')
    email.value = ''

  } catch (err) {
    error.value = t('forgotPassword.serverError')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container">

    <h2>{{ t('forgotPassword.title') }}</h2>

    <input
      v-model="email"
      type="email"
      :placeholder="t('forgotPassword.emailPlaceholder')"
    />

    <button
      @click="sendResetLink"
      :disabled="loading"
    >
      {{ loading ? t('forgotPassword.sending') : t('forgotPassword.sendLink') }}
    </button>

    <p v-if="message" style="color: green">
      {{ message }}
    </p>

    <p v-if="error" style="color: red">
      {{ error }}
    </p>

    <router-link to="/login">
      {{ t('forgotPassword.backToLogin') }}
    </router-link>

  </div>
</template>