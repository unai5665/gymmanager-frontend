<script setup>
import AppSidebar from '../components/AppSidebar.vue'
import AppHeader from '../components/AppHeader.vue'

const sidebarItems = [
  { labelKey: 'nav.users', to: '/superadmin/users' },
  { labelKey: 'nav.organizations', to: '/superadmin/organizations' },
  { labelKey: 'nav.languages', to: '/superadmin/languages' },
  { labelKey: 'nav.accessibility', to: '/superadmin/accessibility' },
  { labelKey: 'nav.profile', to: '/superadmin/profile' },
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
