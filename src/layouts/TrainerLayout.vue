<script setup>
import AppSidebar from '../components/AppSidebar.vue'
import AppHeader from '../components/AppHeader.vue'

const sidebarItems = [
  { labelKey: 'nav.clients', to: '/trainer/clients' },
  { labelKey: 'nav.languages', to: '/trainer/languages' },
  { labelKey: 'nav.accessibility', to: '/trainer/accessibility' },
  { labelKey: 'nav.profile', to: '/trainer/profile' },
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
