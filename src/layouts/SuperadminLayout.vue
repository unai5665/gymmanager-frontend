<script setup>
import { ref } from 'vue'
import AppSidebar from '../components/AppSidebar.vue'
import AppHeader  from '../components/AppHeader.vue'

const sidebarItems = [
  { labelKey: 'nav.users',         to: '/superadmin/users' },
  { labelKey: 'nav.organizations', to: '/superadmin/organizations' },
]

const mobileOpen = ref(false)
</script>

<template>
  <div class="layout">
    <AppSidebar :items="sidebarItems" :mobile-open="mobileOpen" @close="mobileOpen = false" />
    <div class="layout-main">
      <AppHeader @toggle-sidebar="mobileOpen = !mobileOpen" />
      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>
