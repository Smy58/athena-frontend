import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/characters',
    name: 'characters',
    component: () => import('../views/CharactersListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/characters/new',
    name: 'character-create',
    component: () => import('../views/CharacterCreateView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/characters/:id',
    name: 'character-view',
    component: () => import('../views/CharacterView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/quests',
    name: 'quests',
    component: () => import('../views/QuestsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/news',
    name: 'news',
    component: () => import('../views/NewsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/news/:id',
    name: 'news-detail',
    component: () => import('../views/NewsDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/guild',
    name: 'guild',
    component: () => import('../views/GuildView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/shop',
    name: 'shop',
    component: () => import('../views/ShopView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/backpack',
    name: 'backpack',
    component: () => import('../views/BackpackView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/shop/history',
    name: 'shop-history',
    component: () => import('../views/ShopHistoryView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tavern',
    name: 'tavern',
    component: () => import('../views/TavernView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tavern/history',
    name: 'tavern-history',
    component: () => import('../views/TavernHistoryView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/support',
    name: 'support',
    component: () => import('../views/SupportView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('../views/HistoryView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/faq',
    name: 'faq',
    component: () => import('../views/FaqView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/masters',
    name: 'masters',
    component: () => import('../views/MastersView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/schedule',
    name: 'schedule',
    component: () => import('../views/ScheduleView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login' }
  }
})

export default router
