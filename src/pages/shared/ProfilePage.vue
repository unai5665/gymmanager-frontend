<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../../stores/auth'
import { apiPut } from '../../services/api'
import PasswordInput from '../../components/PasswordInput.vue'

const { t } = useI18n()
const authStore = useAuthStore()

const form = ref({
  nombre:   authStore.user?.nombre   || '',
  apellido: authStore.user?.apellido || '',
  telefono: authStore.user?.telefono || '',
  email:    authStore.user?.email    || '',
})

const passwordForm = ref({ current_password: '', password: '', password_confirmation: '' })
const saving = ref(false)
const savingPwd = ref(false)
const error = ref('')
const errorPwd = ref('')
const success = ref('')
const successPwd = ref('')

async function handleProfileSave() {
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const updated = await apiPut(`/usuarios/${authStore.user.id}`, form.value)
    authStore.setAuth({ user: updated.usuario || updated, token: authStore.token })
    success.value = t('profile.savedOk')
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

async function handlePasswordSave() {
  if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
    errorPwd.value = t('setupPassword.passwordMismatch')
    return
  }
  savingPwd.value = true
  errorPwd.value = ''
  successPwd.value = ''
  try {
    await apiPut('/usuario/password', passwordForm.value)
    successPwd.value = t('profile.passwordOk')
    passwordForm.value = { current_password: '', password: '', password_confirmation: '' }
  } catch (e) {
    errorPwd.value = e.message
  } finally {
    savingPwd.value = false
  }
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">{{ t('profile.title') }}</h1>

    <div class="profile-meta">
      <div class="profile-meta-item">
        <span class="profile-meta-label">{{ t('table.role') }}</span>
        <span class="profile-meta-value">{{ t(`roles.${authStore.user?.rol}`) }}</span>
      </div>
      <div v-if="authStore.user?.organizacion?.nombre" class="profile-meta-item">
        <span class="profile-meta-label">{{ t('table.organization') }}</span>
        <span class="profile-meta-value">{{ authStore.user.organizacion.nombre }}</span>
      </div>
    </div>

    <div class="settings-grid">
      <!-- Profile info -->
      <div class="settings-card">
        <h2 class="settings-card-title">{{ t('profile.editProfile') }}</h2>
        <form class="settings-form" @submit.prevent="handleProfileSave">
          <div class="form-row">
            <div class="form-group">
              <label>{{ t('users.firstName') }}</label>
              <input v-model="form.nombre" type="text" required />
            </div>
            <div class="form-group">
              <label>{{ t('users.lastName') }}</label>
              <input v-model="form.apellido" type="text" required />
            </div>
          </div>
          <div class="form-group">
            <label>{{ t('login.emailPlaceholder') }}</label>
            <input v-model="form.email" type="email" required />
          </div>
          <div class="form-group">
            <label>{{ t('users.phone') }}</label>
            <input v-model="form.telefono" type="tel" />
          </div>
          <p v-if="error" class="form-error">{{ error }}</p>
          <p v-if="success" class="form-success">{{ success }}</p>
          <button type="submit" class="btn-primary" :disabled="saving" style="width: auto; padding: 9px 24px">
            {{ saving ? t('common.loading') : t('common.save') }}
          </button>
        </form>
      </div>

      <!-- Change password -->
      <div class="settings-card">
        <h2 class="settings-card-title">{{ t('profile.changePassword') }}</h2>
        <form class="settings-form" @submit.prevent="handlePasswordSave">
          <div class="form-group">
            <label>{{ t('profile.currentPassword') }}</label>
            <PasswordInput v-model="passwordForm.current_password" required />
          </div>
          <div class="form-group">
            <label>{{ t('profile.newPassword') }}</label>
            <PasswordInput v-model="passwordForm.password" required />
          </div>
          <div class="form-group">
            <label>{{ t('setupPassword.confirmPasswordPlaceholder') }}</label>
            <PasswordInput v-model="passwordForm.password_confirmation" required />
          </div>
          <p v-if="errorPwd" class="form-error">{{ errorPwd }}</p>
          <p v-if="successPwd" class="form-success">{{ successPwd }}</p>
          <button type="submit" class="btn-primary" :disabled="savingPwd" style="width: auto; padding: 9px 24px">
            {{ savingPwd ? t('common.loading') : t('profile.changePassword') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
