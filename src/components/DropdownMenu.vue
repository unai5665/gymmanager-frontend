<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  items:  { type: Array,  required: true },
  label:  { type: String, default: '···' },
})

const open       = ref(false)
const wrapperRef = ref(null)
const menuStyle  = ref({})

function toggle() {
  if (!open.value && wrapperRef.value) {
    const rect = wrapperRef.value.getBoundingClientRect()
    menuStyle.value = {
      position: 'fixed',
      top:   (rect.bottom + 4) + 'px',
      right: (window.innerWidth - rect.right) + 'px',
    }
  }
  open.value = !open.value
}

function handleAction(item) {
  open.value = false
  item.action()
}

function handleOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(()  => document.addEventListener('click', handleOutside, true))
onUnmounted(() => document.removeEventListener('click', handleOutside, true))
</script>

<template>
  <div class="dropdown" ref="wrapperRef">
    <button class="dropdown-trigger" @click.stop="toggle">{{ label }}</button>
    <Teleport to="body">
      <div v-if="open" class="dropdown-menu" :style="menuStyle">
        <button
          v-for="item in items"
          :key="item.label"
          :class="`dropdown-item${item.variant ? ' dropdown-item--' + item.variant : ''}`"
          @click="handleAction(item)"
        >
          {{ item.label }}
        </button>
      </div>
    </Teleport>
  </div>
</template>
