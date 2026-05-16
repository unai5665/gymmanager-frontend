<script setup>
const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
})

function getInitials(user) {
  if (!user) return '?'
  const first = user.nombre?.[0] || ''
  const last = user.apellido?.[0] || ''
  return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || '?'
}
</script>

<template>
  <div class="user-avatar" :title="user ? `${user.nombre} ${user.apellido}` : ''">
    {{ getInitials(user) }}
  </div>
</template>
