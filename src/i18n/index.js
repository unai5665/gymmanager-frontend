import { createI18n } from 'vue-i18n'

import es from './es.json'
import en from './en.json'

const messages = {
  es,
  en
}

const i18n = createI18n({
  legacy: false, // Composition API mode
  locale: 'es',  // idioma por defecto
  fallbackLocale: 'en',
  messages
})

export default i18n