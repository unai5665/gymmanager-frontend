import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/login.vue'
import Dashboard from '../views/dashboardcliente.vue'
import ForgotPassword from '../views/auth/forgotpassword.vue'

const routes = [
  { path: '/', redirect: '/login' }, // 👈 login principal
  { path: '/login', component: Login },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/auth/register.vue')  
  },

  { path: '/forgotpassword', component: ForgotPassword },

  {
  path: '/resetpassword',
  component: () => import('../views/auth/ResetPassword.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// protección rutas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router