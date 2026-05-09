<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { login, setUser } from '../../services/auth'

const email = ref('')
const password = ref('')
const router = useRouter()
const { t } = useI18n()

async function handleLogin() {
  try {
    const data = await login(email.value, password.value)
    if (data.user) {
      setUser(data.user)
    }

    router.push('/dashboard')
  } catch (error) {
    alert(error.message)
  }
}
</script>

<template>
  <div>
    <h2>{{ t('login.title') }}</h2>

    <input v-model="email" :placeholder="t('login.emailPlaceholder')" />
    <input v-model="password" type="password" :placeholder="t('login.passwordPlaceholder')" />

    <button @click="handleLogin">{{ t('login.submitButton') }}</button>

    <p>
      {{ t('login.noAccount') }}
      <router-link to="/register">{{ t('login.registerLink') }}</router-link>
    </p>

    <p>
      <router-link to="/forgotpassword">
        {{ t('login.forgotPasswordLink') }}
      </router-link>
    </p>
  </div>
</template>