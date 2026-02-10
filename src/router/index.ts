import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: false, layout: 'none' }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false, layout: 'auth' }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true, layout: 'default' }
    },
    {
      path: '/room/:id',
      name: 'chat-room',
      component: () => import('@/views/ChatRoomView.vue'),
      meta: { requiresAuth: true, layout: 'default' },
      props: true
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: { requiresAuth: false, layout: 'none' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/'
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const themeStore = useThemeStore()

  // Initialize theme on every route change
  themeStore.initTheme()

  const requiresAuth = to.meta.requiresAuth as boolean

  // Wait for auth initialization if still loading
  if (authStore.isLoading) {
    next()
    return
  }

  const isAuthenticated = authStore.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if trying to access protected route
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (!requiresAuth && isAuthenticated && (to.name === 'login' || to.name === 'home')) {
    // Redirect to dashboard if already logged in and trying to access login or home
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router