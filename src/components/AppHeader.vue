<script setup>
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import UserAvatar from './UserAvatar.vue'

const { t } = useI18n()
const authStore = useAuthStore()

defineProps({
  navItems: { type: Array, default: () => [] },
})
const emit = defineEmits(['toggleSidebar'])
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <button class="btn-hamburger" @click="emit('toggleSidebar')" aria-label="Abrir menú">
        <span></span><span></span><span></span>
      </button>
      <slot name="title" />
      <nav v-if="navItems.length" class="header-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="header-nav-link"
        >
          {{ t(item.labelKey) }}
        </router-link>
      </nav>
    </div>
    <div class="header-right">
      <UserAvatar :user="authStore.user" />
    </div>
  </header>
</template>
