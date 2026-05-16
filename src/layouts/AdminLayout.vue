<script setup>
import AppSidebar from '../components/AppSidebar.vue'
import AppHeader from '../components/AppHeader.vue'

const sidebarItems = [
  { labelKey: 'nav.users', to: '/admin/users' },
]
</script>

<template>
  <div class="layout">
    <AppSidebar :items="sidebarItems" />
    <div class="layout-main">
      <AppHeader />
      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>
