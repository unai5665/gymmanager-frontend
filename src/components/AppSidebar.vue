<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { logout, getCurrentUser } from '../services/auth'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

defineProps({
  items: { type: Array, required: true },
})

const ROLE_HOME = {
  superadmin:   '/superadmin/users',
  administrador: '/admin/users',
  entrenador:   '/trainer/clients',
  cliente:      '/client/dashboard',
}

const ROLE_PREFIX = {
  superadmin:   '/superadmin',
  administrador: '/admin',
  entrenador:   '/trainer',
  cliente:      '/client',
}

const homeRoute   = computed(() => ROLE_HOME[authStore.role]   || '/login')
const rolePrefix  = computed(() => ROLE_PREFIX[authStore.role] || '')
const user        = computed(() => authStore.user)

const initials = computed(() => {
  const u = user.value
  if (!u) return '?'
  return ((u.nombre?.[0] ?? '') + (u.apellido?.[0] ?? '')).toUpperCase() || '?'
})

const profileOpen = ref(false)
const profileBtnRef = ref(null)
const menuStyle = ref({})

function toggleProfile() {
  if (!profileOpen.value && profileBtnRef.value) {
    const rect = profileBtnRef.value.getBoundingClientRect()
    menuStyle.value = {
      position: 'fixed',
      bottom: (window.innerHeight - rect.bottom) + 'px',
      left: (rect.right + 8) + 'px',
    }
  }
  profileOpen.value = !profileOpen.value
}

function handleOutside(e) {
  if (profileBtnRef.value && !profileBtnRef.value.contains(e.target)) {
    profileOpen.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleOutside, true)
  if (authStore.isAuthenticated) {
    try {
      const fresh = await getCurrentUser()
      authStore.setAuth({ user: fresh, token: authStore.token })
    } catch {}
  }
})
onUnmounted(() => document.removeEventListener('click', handleOutside, true))

function goTo(path) {
  profileOpen.value = false
  router.push(path)
}

async function handleLogout() {
  profileOpen.value = false
  await logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <router-link :to="homeRoute" class="sidebar-brand">GymManager</router-link>

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

    <div class="sidebar-profile-wrap" ref="profileBtnRef">
      <button class="sidebar-profile-btn" @click.stop="toggleProfile">
        <div class="sidebar-avatar">{{ initials }}</div>
        <div class="sidebar-user-info">
          <span class="sidebar-user-name">{{ user?.nombre }} {{ user?.apellido }}</span>
          <span class="sidebar-user-sub">{{ user?.organizacion?.nombre ?? '—' }}</span>
          <span class="sidebar-user-sub">{{ t(`roles.${user?.rol}`) }}</span>
        </div>
        <span class="sidebar-profile-chevron">›</span>
      </button>

      <Teleport to="body">
        <Transition name="profile-menu">
          <div v-if="profileOpen" class="sidebar-profile-menu" :style="menuStyle">
            <button class="sidebar-profile-item" @click="goTo(rolePrefix + '/languages')">
              {{ t('nav.languages') }}
            </button>
            <button class="sidebar-profile-item" @click="goTo(rolePrefix + '/accessibility')">
              {{ t('nav.accessibility') }}
            </button>
            <button class="sidebar-profile-item" @click="goTo(rolePrefix + '/profile')">
              {{ t('nav.profile') }}
            </button>
            <div class="sidebar-profile-divider"></div>
            <button class="sidebar-profile-item sidebar-profile-item--danger" @click="handleLogout">
              {{ t('common.logout') }}
            </button>
          </div>
        </Transition>
      </Teleport>
    </div>
  </aside>
</template>
