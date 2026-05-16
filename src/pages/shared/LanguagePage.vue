<script setup>
import { useI18n } from 'vue-i18n'
import { useUiStore } from '../../stores/ui'

const { t, locale } = useI18n()
const ui = useUiStore()

function setLang(lang) {
  ui.setLanguage(lang)
  locale.value = lang
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">{{ t('languages.title') }}</h1>

    <div class="settings-grid">
      <div class="settings-card">
        <h2 class="settings-card-title">{{ t('languages.selectLanguage') }}</h2>
        <div class="settings-options">
          <button
            :class="['settings-option', { 'settings-option--active': ui.language === 'es' }]"
            @click="setLang('es')"
          >
            <span class="option-flag">🇪🇸</span>
            <span>{{ t('languages.spanish') }}</span>
          </button>
          <button
            :class="['settings-option', { 'settings-option--active': ui.language === 'en' }]"
            @click="setLang('en')"
          >
            <span class="option-flag">🇬🇧</span>
            <span>{{ t('languages.english') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
