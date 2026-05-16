<script setup>
import AppSidebar from '../components/AppSidebar.vue'
import AppHeader from '../components/AppHeader.vue'

const sidebarItems = [
  { labelKey: 'nav.users', to: '/admin/users' },
  { labelKey: 'nav.languages', to: '/admin/languages' },
  { labelKey: 'nav.accessibility', to: '/admin/accessibility' },
  { labelKey: 'nav.profile', to: '/admin/profile' },
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
