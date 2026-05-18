<script setup>
import AppSidebar from '../components/AppSidebar.vue'
import AppHeader from '../components/AppHeader.vue'

const navItems = [
  { labelKey: 'nav.streak',    to: '/client/racha' },
  { labelKey: 'nav.goals',     to: '/client/goals' },
  { labelKey: 'nav.myRoutine', to: '/client/routine' },
]
</script>

<template>
  <div class="layout">
    <AppSidebar :items="[]" />
    <div class="layout-main">
      <AppHeader :nav-items="navItems" />
      <main class="layout-content">
        <router-view />
      </main>
    </div>
  </div>
</template>
