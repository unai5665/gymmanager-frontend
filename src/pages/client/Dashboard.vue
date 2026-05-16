<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiGet } from '../../services/api'

const { t } = useI18n()
const racha   = ref(null)
const loading = ref(true)
const error   = ref('')

onMounted(async () => {
  try {
    racha.value = await apiGet('/racha')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page">
    <h1 class="page-title">{{ t('dashboard.client.title') }}</h1>

    <div v-if="loading" class="dashboard-loading"><span class="spinner" /></div>

    <div v-else class="dashboard-grid">
      <!-- Streak -->
      <div class="stat-card stat-card--streak">
        <div class="stat-card-label">{{ t('nav.streak') }}</div>
        <div class="stat-card-value">
          {{ racha ? racha.racha_actual : '—' }}
        </div>
        <div v-if="racha" class="stat-card-sub">
          {{ t('dashboard.client.maxStreak') }}: {{ racha.racha_maxima }}
        </div>
      </div>

      <!-- Routine placeholder -->
      <div class="stat-card stat-card--placeholder">
        <div class="stat-card-label">{{ t('nav.myRoutine') }}</div>
        <div class="stat-card-value placeholder-dash">—</div>
        <div class="stat-card-sub">{{ t('dashboard.client.comingSoon') }}</div>
      </div>

      <!-- Goals placeholder -->
      <div class="stat-card stat-card--placeholder">
        <div class="stat-card-label">{{ t('nav.goals') }}</div>
        <div class="stat-card-value placeholder-dash">—</div>
        <div class="stat-card-sub">{{ t('dashboard.client.comingSoon') }}</div>
      </div>
    </div>
  </div>
</template>
