<script setup>
defineProps({
  status: { type: String, required: true },
})

const colorMap = {
  activo: 'green',
  inactivo: 'gray',
  activa: 'green',
  inactiva: 'gray',
}
</script>

<template>
  <span :class="`badge badge--${colorMap[status] ?? 'gray'}`">
    {{ status }}
  </span>
</template>
