<script setup>
import { ref } from 'vue'

defineProps({
  modelValue:  { type: String, default: '' },
  placeholder: { type: String, default: '' },
  required:    { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])

const show = ref(false)
</script>

<template>
  <div class="password-input-wrap">
    <input
      :type="show ? 'text' : 'password'"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      autocomplete="current-password"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <button type="button" class="password-toggle" @click="show = !show" tabindex="-1" :aria-label="show ? 'Ocultar contraseña' : 'Mostrar contraseña'">
      <!-- eye-off -->
      <svg v-if="show" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
      <!-- eye -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </button>
  </div>
</template>
