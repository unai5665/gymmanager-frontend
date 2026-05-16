<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { logout } from '../services/auth'

const { t } = useI18n()
const router = useRouter()

defineProps({
  items: {
    type: Array,
    required: true,
  },
})

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-brand">GymManager</div>
    <nav class="sidebar-nav">
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="sidebar-item"
      >
        {{ t(item.labelKey) }}
      </router-link>
    </nav>
    <button class="sidebar-logout" @click="handleLogout">
      {{ t('common.logout') }}
    </button>
  </aside>
</template>
