<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

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
    const res = await fetch('http://localhost:8000/api/resetpassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        token: token,
        password: password.value,
        password_confirmation: password_confirmation.value
      })
    })

    const data = await res.json()

    if (!res.ok) {
      error.value = data.message
      return
    }

    message.value = 'Contraseña actualizada correctamente'

    // 👉 LOGIN AUTOMÁTICO (opcional pero PRO)
    setTimeout(() => {
      router.push('/login')
    }, 1500)

  } catch (err) {
    error.value = 'Error de conexión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>

    <h2>Nueva contraseña</h2>

    <input v-model="email" placeholder="Email" />

    <input
      v-model="password"
      type="password"
      placeholder="Nueva contraseña"
    />

    <input
      v-model="password_confirmation"
      type="password"
      placeholder="Repetir contraseña"
    />

    <button @click="resetPassword" :disabled="loading">
      {{ loading ? 'Actualizando...' : 'Cambiar contraseña' }}
    </button>

    <p v-if="message" style="color: green">
      {{ message }}
    </p>

    <p v-if="error" style="color: red">
      {{ error }}
    </p>

  </div>
</template>