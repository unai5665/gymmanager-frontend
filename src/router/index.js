import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },

  {
    path: '/login',
    component: () => import('../views/auth/Login.vue')
  },

  {
    path: '/register',
    component: () => import('../views/auth/Register.vue')
  },

  {
    path: '/forgotpassword',
    component: () => import('../views/auth/ForgotPassword.vue')
  },

  {
    path: '/resetpassword',
    component: () => import('../views/auth/ResetPassword.vue')
  },

  {
    path: '/dashboard',
    component: () => import('../views/DashboardCliente.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// auth guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router