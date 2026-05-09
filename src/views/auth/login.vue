<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../../services/auth'

const email = ref('')
const password = ref('')
const router = useRouter()

async function handleLogin() {
  try {
    const data = await login(email.value, password.value)

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    router.push('/dashboard')
  } catch (error) {
    alert(error.message)
  }
}
</script>

<template>
  <div>
    <h2>Login</h2>

    <input v-model="email" placeholder="Correo" />
    <input v-model="password" type="password" placeholder="Contraseña" />

    <button @click="handleLogin">Entrar</button>

    <p>
      ¿No tienes cuenta?
      <router-link to="/register">Regístrate</router-link>
    </p>

    <p>
      <router-link to="/forgotpassword">
        ¿Olvidaste la contraseña?
      </router-link>
    </p>
  </div>
</template>