<script setup>
import { useI18n } from 'vue-i18n'
import Modal from './Modal.vue'

const { t } = useI18n()

defineProps({
  show:    { type: Boolean, required: true },
  title:   { type: String, default: '' },
  message: { type: String, default: '' },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Modal :show="show" :title="title" size="sm" @close="emit('cancel')">
    <p class="confirm-message">{{ message }}</p>
    <template #footer>
      <div class="modal-actions">
        <button class="btn-secondary" @click="emit('cancel')">
          {{ t('actions.cancel') }}
        </button>
        <button class="btn-danger" @click="emit('confirm')">
          {{ t('actions.confirm') }}
        </button>
      </div>
    </template>
  </Modal>
</template>
