import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    sidebarCollapsed: false,
    language: localStorage.getItem('language') || 'es',
    fontSize: localStorage.getItem('fontSize') || 'normal',
    highContrast: localStorage.getItem('highContrast') === 'true',
    activeModal: null,
  }),
  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    setLanguage(lang) {
      this.language = lang
      localStorage.setItem('language', lang)
    },
    setFontSize(size) {
      this.fontSize = size
      localStorage.setItem('fontSize', size)
      document.documentElement.setAttribute('data-font-size', size)
    },
    setHighContrast(value) {
      this.highContrast = value
      localStorage.setItem('highContrast', value)
      document.documentElement.setAttribute('data-contrast', value ? 'high' : 'default')
    },
    openModal(name) {
      this.activeModal = name
    },
    closeModal() {
      this.activeModal = null
    },
    applyOnStartup() {
      document.documentElement.setAttribute('data-font-size', this.fontSize)
      document.documentElement.setAttribute('data-contrast', this.highContrast ? 'high' : 'default')
    },
  },
})
