<script setup>
import AppSidebar from '../components/AppSidebar.vue'
import AppHeader from '../components/AppHeader.vue'

const sidebarItems = [
  { labelKey: 'nav.streak', to: '/client/streak' },
  { labelKey: 'nav.goals', to: '/client/goals' },
  { labelKey: 'nav.myRoutine', to: '/client/routine' },
  { labelKey: 'nav.languages', to: '/client/languages' },
  { labelKey: 'nav.accessibility', to: '/client/accessibility' },
  { labelKey: 'nav.profile', to: '/client/profile' },
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
