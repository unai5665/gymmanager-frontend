import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', redirect: '/login' },

  // Public
  { path: '/login', component: () => import('../pages/auth/Login.vue') },
  { path: '/forgot-password', component: () => import('../pages/auth/ForgotPassword.vue') },
  { path: '/setup-password/:token', component: () => import('../pages/auth/SetupPassword.vue') },
  { path: '/unauthorized', component: () => import('../pages/Unauthorized.vue') },

  // Superadmin
  {
    path: '/superadmin',
    component: () => import('../layouts/SuperadminLayout.vue'),
    meta: { requiresAuth: true, role: 'superadmin' },
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', component: () => import('../pages/superadmin/Dashboard.vue') },
    ],
  },

  // Admin
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', component: () => import('../pages/admin/Dashboard.vue') },
    ],
  },

  // Trainer
  {
    path: '/trainer',
    component: () => import('../layouts/TrainerLayout.vue'),
    meta: { requiresAuth: true, role: 'trainer' },
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', component: () => import('../pages/trainer/Dashboard.vue') },
    ],
  },

  // Client
  {
    path: '/client',
    component: () => import('../layouts/ClientLayout.vue'),
    meta: { requiresAuth: true, role: 'client' },
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', component: () => import('../pages/client/Dashboard.vue') },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  if (to.meta.role && authStore.role !== to.meta.role) {
    return next('/unauthorized')
  }

  next()
})

export default router
