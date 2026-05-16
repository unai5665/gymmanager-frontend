<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['search'])
const query = ref('')
let timer = null

function onInput() {
  clearTimeout(timer)
  timer = setTimeout(() => emit('search', query.value), 350)
}

function onClear() {
  query.value = ''
  emit('search', '')
}
</script>

<template>
  <div class="search-bar">
    <span class="search-icon">⌕</span>
    <input
      v-model="query"
      type="search"
      class="search-input"
      :placeholder="t('actions.search')"
      @input="onInput"
    />
    <button v-if="query" class="search-clear" @click="onClear">×</button>
  </div>
</template>
