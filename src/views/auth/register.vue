<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const nombre = ref('')
const apellido = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')
const { t } = useI18n()

async function register() {
  const res = await fetch('http://127.0.0.1:8000/api/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({
      nombre: nombre.value,
      apellido: apellido.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value
    })
  })

  const data = await res.json()

  if (data.token) {
    localStorage.setItem('token', data.token)
    window.location.href = '/dashboard'
  }
}
</script>

<template>
  <div>
    <h2>{{ t('register.title') }}</h2>

    <input v-model="nombre" :placeholder="t('register.firstNamePlaceholder')" />
    <input v-model="apellido" :placeholder="t('register.lastNamePlaceholder')" />
    <input v-model="email" :placeholder="t('register.emailPlaceholder')" />
    <input v-model="password" type="password" :placeholder="t('register.passwordPlaceholder')" />
    <input v-model="password_confirmation" type="password" :placeholder="t('register.passwordConfirmationPlaceholder')" />

    <button @click="register">{{ t('register.submitButton') }}</button>
  </div>
</template>