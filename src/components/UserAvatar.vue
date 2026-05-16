<script setup>
const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
})

function getInitials(user) {
  if (!user) return '?'
  const name = user.name || user.email || ''
  return name.slice(0, 2).toUpperCase()
}
</script>

<template>
  <div class="user-avatar" :title="user?.name || user?.email">
    {{ getInitials(user) }}
  </div>
</template>
