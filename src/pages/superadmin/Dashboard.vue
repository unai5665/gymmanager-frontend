<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <div class="page">
    <h1 class="page-title">{{ t('dashboard.superadmin.title') }}</h1>
    <div class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-card-label">{{ t('nav.users') }}</div>
        <div class="stat-card-value">—</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-label">{{ t('nav.organizations') }}</div>
        <div class="stat-card-value">—</div>
      </div>
    </div>
  </div>
</template>
