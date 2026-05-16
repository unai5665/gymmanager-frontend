<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiGet } from '../../services/api'

const { t } = useI18n()
const stats   = ref(null)
const loading = ref(true)
const error   = ref('')

onMounted(async () => {
  try {
    stats.value = await apiGet('/dashboard')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page">
    <h1 class="page-title">{{ t('dashboard.superadmin.title') }}</h1>

    <div v-if="loading" class="dashboard-loading">
      <span class="spinner" />
    </div>

    <p v-else-if="error" class="form-error">{{ error }}</p>

    <template v-else-if="stats">
      <div class="dashboard-grid">
        <div v-for="(value, key) in stats" :key="key" class="stat-card">
          <div class="stat-card-label">{{ key }}</div>
          <div class="stat-card-value">{{ value }}</div>
        </div>
      </div>
    </template>
  </div>
</template>
