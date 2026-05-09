<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { register as registerService, setUser } from '../../services/auth'

const nombre = ref('')
const apellido = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')
const router = useRouter()
const { t } = useI18n()

async function handleRegister() {
  try {
    const data = await registerService({
      nombre: nombre.value,
      apellido: apellido.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value
    })
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
    <h2>{{ t('register.title') }}</h2>

    <input v-model="nombre" :placeholder="t('register.firstNamePlaceholder')" />
    <input v-model="apellido" :placeholder="t('register.lastNamePlaceholder')" />
    <input v-model="email" :placeholder="t('register.emailPlaceholder')" />
    <input v-model="password" type="password" :placeholder="t('register.passwordPlaceholder')" />
    <input v-model="password_confirmation" type="password" :placeholder="t('register.passwordConfirmationPlaceholder')" />

    <button @click="handleRegister">{{ t('register.submitButton') }}</button>
  </div>
</template>