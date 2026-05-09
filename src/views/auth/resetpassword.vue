<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { resetPassword as resetPasswordService } from '../../services/auth'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const email = ref(route.query.email || '')
const token = route.query.token || ''

const password = ref('')
const password_confirmation = ref('')

const message = ref('')
const error = ref('')
const loading = ref(false)

async function resetPassword() {
  loading.value = true
  message.value = ''
  error.value = ''

  try {
    await resetPasswordService({
      email: email.value,
      token: token,
      password: password.value,
      password_confirmation: password_confirmation.value
    })

    message.value = t('resetPassword.updatedMessage')

    // 👉 LOGIN AUTOMÁTICO (opcional pero PRO)
    setTimeout(() => {
      router.push('/login')
    }, 1500)

  } catch (err) {
    error.value = t('resetPassword.connectionError')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>

    <h2>{{ t('resetPassword.title') }}</h2>

    <input v-model="email" :placeholder="t('resetPassword.emailPlaceholder')" />

    <input
      v-model="password"
      type="password"
      :placeholder="t('resetPassword.newPasswordPlaceholder')"
    />

    <input
      v-model="password_confirmation"
      type="password"
      :placeholder="t('resetPassword.confirmPasswordPlaceholder')"
    />

    <button @click="resetPassword" :disabled="loading">
      {{ loading ? t('resetPassword.changing') : t('resetPassword.changeButton') }}
    </button>

    <p v-if="message" style="color: green">
      {{ message }}
    </p>

    <p v-if="error" style="color: red">
      {{ error }}
    </p>

  </div>
</template>