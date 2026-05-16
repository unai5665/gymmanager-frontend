<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <p class="auth-title">GymManager</p>
      <h1 class="auth-subtitle">{{ t('unauthorized.title') }}</h1>
      <p class="auth-message">{{ t('unauthorized.message') }}</p>
      <button class="btn-primary" style="margin-top: 20px" @click="router.push('/login')">
        {{ t('unauthorized.backToLogin') }}
      </button>
    </div>
  </div>
</template>
