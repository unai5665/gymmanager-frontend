<script setup>
import { ref } from 'vue'

const email = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')

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
      error.value = data.message || 'Error enviando email'
      return
    }

    message.value = 'Revisa tu correo 📩 (o logs si estás en modo local)'
    email.value = ''

  } catch (err) {
    error.value = 'Error de conexión con el servidor'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container">

    <h2>Recuperar contraseña</h2>

    <input
      v-model="email"
      type="email"
      placeholder="Introduce tu email"
    />

    <button
      @click="sendResetLink"
      :disabled="loading"
    >
      {{ loading ? 'Enviando...' : 'Enviar enlace' }}
    </button>

    <p v-if="message" style="color: green">
      {{ message }}
    </p>

    <p v-if="error" style="color: red">
      {{ error }}
    </p>

    <router-link to="/login">
      Volver al login
    </router-link>

  </div>
</template>