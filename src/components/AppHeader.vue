<script setup>
import { useAuthStore } from '../stores/auth'
import UserAvatar from './UserAvatar.vue'
import OrganizationBadge from './OrganizationBadge.vue'

const authStore = useAuthStore()
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <slot name="title" />
    </div>
    <div class="header-right">
      <OrganizationBadge
        v-if="authStore.organization"
        :organization="authStore.organization"
      />
      <UserAvatar :user="authStore.user" />
    </div>
  </header>
</template>
