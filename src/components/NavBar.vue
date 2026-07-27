<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const mobileOpen = ref(false)

const loggedInLinks = [
  { to: '/dashboard', label: '🏰 Кабинет' },
  { to: '/characters', label: '⚔️ Персонажи' },
  { to: '/schedule', label: '📅 Расписание игр' },
]

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}

function closeMobile() {
  mobileOpen.value = false
}

function handleLogout() {
  closeMobile()
  auth.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <nav class="nav">
    <RouterLink to="/" class="logo" @click="closeMobile">
      <span class="logo-owl">🦉</span>
      <span class="logo-text">Клуб <em>Афина</em></span>
    </RouterLink>

    <div v-if="!auth.isLoggedIn" class="nav-links">
      <RouterLink to="/about" class="btn btn-ghost">О клубе</RouterLink>
      <RouterLink to="/login" class="btn btn-ghost">Войти</RouterLink>
      <RouterLink to="/register" class="btn btn-primary">Вступить</RouterLink>
    </div>

    <div v-else class="nav-links">
      <RouterLink v-for="link in loggedInLinks" :key="link.to" :to="link.to" class="btn btn-ghost">{{ link.label }}</RouterLink>
      <span class="nav-user">{{ auth.user?.name }}</span>
      <button class="btn btn-outline btn-sm" @click="handleLogout">Выйти</button>
    </div>

    <button
      class="mobile-menu-btn"
      :class="{ active: mobileOpen }"
      aria-label="Меню"
      @click="toggleMobile"
    >
      {{ mobileOpen ? '✕' : '☰' }}
    </button>
  </nav>

  <div class="mobile-menu-backdrop" :class="{ open: mobileOpen }" @click="closeMobile"></div>
  <div class="mobile-menu" :class="{ open: mobileOpen }">
    <template v-if="!auth.isLoggedIn">
      <RouterLink to="/" class="mobile-menu-item" @click="closeMobile">🏠 Главная</RouterLink>
      <RouterLink to="/about" class="mobile-menu-item" @click="closeMobile">📖 О клубе</RouterLink>
      <div class="mobile-menu-divider"></div>
      <RouterLink to="/login" class="mobile-menu-item" @click="closeMobile">Войти</RouterLink>
      <RouterLink to="/register" class="mobile-menu-item primary" @click="closeMobile">✦ Вступить в клуб</RouterLink>
    </template>
    <template v-else>
      <RouterLink
        v-for="link in loggedInLinks"
        :key="link.to"
        :to="link.to"
        class="mobile-menu-item"
        @click="closeMobile"
      >
        {{ link.label }}
      </RouterLink>
      <div class="mobile-menu-divider"></div>
      <button class="mobile-menu-item danger" @click="handleLogout">Выйти</button>
    </template>
  </div>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(13, 13, 18, 0.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--b);
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 58px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.logo-owl {
  width: 32px;
  height: 32px;
  background: var(--p);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
}
.logo-text {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--t);
}
.logo-text em {
  color: var(--pp);
  font-style: normal;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.nav-user {
  font-size: 0.8rem;
  color: var(--t2);
  margin: 0 0.3rem;
}

.mobile-menu-btn {
  display: none;
  background: transparent;
  border: 1px solid var(--b);
  border-radius: var(--r);
  color: var(--t2);
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: 0.25s;
}
.mobile-menu-btn:hover {
  border-color: var(--b2);
  color: var(--t);
}
.mobile-menu-btn.active {
  border-color: var(--pl);
  color: var(--pl);
}
.mobile-menu-backdrop {
  position: fixed;
  top: 58px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 240;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease, visibility 0s linear 0.25s;
}
.mobile-menu-backdrop.open {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.25s ease;
}
.mobile-menu {
  position: fixed;
  top: 58px;
  left: 0;
  right: 0;
  background: var(--bg2);
  border-bottom: 1px solid var(--b2);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.55);
  z-index: 250;
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  max-height: calc(100vh - 58px);
  overflow-y: auto;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-14px);
  transition: opacity 0.25s ease, transform 0.25s ease, visibility 0s linear 0.25s;
}
.mobile-menu.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.mobile-menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.8rem 1rem;
  border-radius: var(--r);
  background: none;
  border: none;
  color: var(--t2);
  font-size: 0.9rem;
  cursor: pointer;
  font-family: var(--font-body);
  transition: 0.15s;
}
.mobile-menu-item:hover {
  background: var(--bg3);
  color: var(--t);
  transform: translateX(3px);
}
.mobile-menu-item.primary {
  background: var(--p) !important;
  color: #fff !important;
  text-align: center;
  margin-top: 0.3rem;
}
.mobile-menu-item.danger {
  color: #f09595 !important;
}
.mobile-menu-divider {
  height: 1px;
  background: var(--b);
  margin: 0.4rem 0.25rem;
}

@media (max-width: 720px) {
  .nav-links {
    display: none;
  }
  .mobile-menu-btn {
    display: flex;
  }
}
</style>
