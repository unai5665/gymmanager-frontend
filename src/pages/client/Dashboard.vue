<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <div class="page">
    <h1 class="page-title">{{ t('dashboard.client.title') }}</h1>
    <div class="dashboard-grid">
      <div class="stat-card stat-card--streak">
        <div class="stat-card-label">{{ t('nav.streak') }}</div>
        <div class="stat-card-value">—</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">{{ t('nav.goals') }}</div>
        <div class="stat-card-value">—</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">{{ t('nav.myRoutine') }}</div>
        <div class="stat-card-value">—</div>
      </div>
    </div>
  </div>
</template>
