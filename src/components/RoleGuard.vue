<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  roles: {
    type: Array,
    required: true,
  },
})

const authStore = useAuthStore()
const hasAccess = computed(() => props.roles.includes(authStore.role))
</script>

<template>
  <slot v-if="hasAccess" />
</template>
