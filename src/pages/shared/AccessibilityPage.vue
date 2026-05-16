<script setup>
import { useI18n } from 'vue-i18n'
import { useUiStore } from '../../stores/ui'

const { t } = useI18n()
const ui = useUiStore()
</script>

<template>
  <div class="page">
    <h1 class="page-title">{{ t('accessibility.title') }}</h1>

    <div class="settings-grid">
      <div class="settings-card">
        <h2 class="settings-card-title">{{ t('accessibility.fontSize') }}</h2>
        <div class="settings-options">
          <button
            :class="['settings-option', { 'settings-option--active': ui.fontSize === 'normal' }]"
            @click="ui.setFontSize('normal')"
          >
            <span class="option-preview" style="font-size: 14px">Aa</span>
            <span>{{ t('accessibility.fontSizeNormal') }}</span>
          </button>
          <button
            :class="['settings-option', { 'settings-option--active': ui.fontSize === 'large' }]"
            @click="ui.setFontSize('large')"
          >
            <span class="option-preview" style="font-size: 18px">Aa</span>
            <span>{{ t('accessibility.fontSizeLarge') }}</span>
          </button>
        </div>
      </div>

      <div class="settings-card">
        <h2 class="settings-card-title">{{ t('accessibility.contrast') }}</h2>
        <div class="settings-options">
          <button
            :class="['settings-option', { 'settings-option--active': !ui.highContrast }]"
            @click="ui.setHighContrast(false)"
          >
            <span class="option-preview contrast-preview--default">●</span>
            <span>{{ t('accessibility.contrastDefault') }}</span>
          </button>
          <button
            :class="['settings-option', { 'settings-option--active': ui.highContrast }]"
            @click="ui.setHighContrast(true)"
          >
            <span class="option-preview contrast-preview--high">●</span>
            <span>{{ t('accessibility.contrastHigh') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
