<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  lastPage:    { type: Number, required: true },
  total:       { type: Number, default: 0 },
})

const emit = defineEmits(['change'])

const pages = computed(() => {
  const range = []
  const delta = 2
  const left = Math.max(1, props.currentPage - delta)
  const right = Math.min(props.lastPage, props.currentPage + delta)
  for (let i = left; i <= right; i++) range.push(i)
  return range
})
</script>

<template>
  <div v-if="lastPage > 1" class="pagination">
    <button
      class="page-btn"
      :disabled="currentPage === 1"
      @click="emit('change', currentPage - 1)"
    >‹</button>

    <button
      v-if="pages[0] > 1"
      class="page-btn"
      @click="emit('change', 1)"
    >1</button>
    <span v-if="pages[0] > 2" class="page-ellipsis">…</span>

    <button
      v-for="p in pages"
      :key="p"
      class="page-btn"
      :class="{ 'page-btn--active': p === currentPage }"
      @click="emit('change', p)"
    >{{ p }}</button>

    <span v-if="pages[pages.length - 1] < lastPage - 1" class="page-ellipsis">…</span>
    <button
      v-if="pages[pages.length - 1] < lastPage"
      class="page-btn"
      @click="emit('change', lastPage)"
    >{{ lastPage }}</button>

    <button
      class="page-btn"
      :disabled="currentPage === lastPage"
      @click="emit('change', currentPage + 1)"
    >›</button>
  </div>
</template>
