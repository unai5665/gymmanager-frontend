<script setup>
import { ref } from 'vue'
import AppSidebar from '../components/AppSidebar.vue'
import AppHeader  from '../components/AppHeader.vue'

const navItems = [
  { labelKey: 'nav.streak',    to: '/client/racha' },
  { labelKey: 'nav.goals',     to: '/client/goals' },
  { labelKey: 'nav.myRoutine', to: '/client/routine' },
]

const mobileOpen = ref(false)
</script>

<template>
  <div class="layout">
    <AppSidebar :items="[]" :mobile-open="mobileOpen" @close="mobileOpen = false" />
    <div class="layout-main">
      <AppHeader :nav-items="navItems" @toggle-sidebar="mobileOpen = !mobileOpen" />
      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>
