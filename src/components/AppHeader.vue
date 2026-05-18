<script setup>
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import UserAvatar from './UserAvatar.vue'
// import OrganizationBadge from './OrganizationBadge.vue'

const { t } = useI18n()
const authStore = useAuthStore()

defineProps({
  navItems: { type: Array, default: () => [] },
})
</script>

<template>
  <header class="app-header">
    <div class="header-left">
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
      <!-- <OrganizationBadge v-if="authStore.organization" :organization="authStore.organization" /> -->
      <UserAvatar :user="authStore.user" />
    </div>
  </header>
</template>
