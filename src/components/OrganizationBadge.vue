<script setup>
defineProps({
  organization: {
    type: [Object, String],
    required: true,
  },
})
</script>

<template>
  <div class="org-badge">
    {{ typeof organization === 'string' ? organization : organization.name }}
  </div>
</template>
