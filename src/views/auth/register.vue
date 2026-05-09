<script setup>
import { ref } from 'vue'

const nombre = ref('')
const apellido = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')

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
    <h2>Registro</h2>

    <input v-model="nombre" placeholder="Nombre" />
    <input v-model="apellido" placeholder="Apellido" />
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <input v-model="password_confirmation" type="password" placeholder="Repetir password" />

    <button @click="register">Crear cuenta</button>
  </div>
</template>