<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import charactersApi from '../api/characters'
import guildApi from '../api/guild'

const auth = useAuthStore()
const characterCount = ref(0)
const guildNames = ref({})

const guildStatus = computed(() => {
  if (!auth.user?.guild) return 'Выбери гильдию'
  return guildNames.value[auth.user.guild] ?? 'Выбери гильдию'
})

const cards = computed(() => [
  { to: '/characters', icon: '⚔️', title: 'Персонажи', sub: `${characterCount.value} персонажей` },
  { to: '/quests', icon: '📋', title: 'Доска заданий', sub: 'Записывайся и получай награды' },
  { to: '/guild', icon: '🏛️', title: 'Гильдия', sub: guildStatus.value },
  { to: '/history', icon: '📜', title: 'История', sub: 'Прошедшие игры и задания' },
  { to: '/faq', icon: '❓', title: 'FAQ', sub: 'Ответы на частые вопросы' },
  { to: '/support', icon: '💬', title: 'Обратная связь', sub: 'Проблемы и предложения' },
  { to: '/shop', icon: '🛍️', title: 'Магазин', sub: `${auth.user?.finiki ?? 0} фиников` },
  { to: '/tavern', icon: '🍺', title: 'Костер и Котел', sub: 'Напитки и еда' },
  { to: '/schedule', icon: '📅', title: 'Расписание игр', sub: 'Фильтруй и записывайся' },
  { to: '/masters', icon: '🧙', title: 'Мастера', sub: 'Каталог и профили' },
])

onMounted(async () => {
  const [list, guildInfo] = await Promise.all([charactersApi.list(), guildApi.info()])
  characterCount.value = list.length
  guildNames.value = Object.fromEntries(guildInfo.map((g) => [g.guild, g.name]))
})
</script>

<template>
  <div class="wrap">
    <p style="font-family: var(--font-display); font-size: 0.65rem; letter-spacing: 0.2em; color: var(--pp); text-transform: uppercase; margin-bottom: 0.4rem">
      Добро пожаловать обратно
    </p>
    <h1 class="title-display" style="font-size: 1.6rem; margin-bottom: 1.75rem">
      Привет, <span class="accent">{{ auth.user?.name }}</span>
    </h1>

    <div class="grid grid-cards">
      <RouterLink v-for="c in cards" :key="c.to" :to="c.to" class="card" style="cursor: pointer">
        <div style="font-size: 1.5rem; margin-bottom: 0.75rem">{{ c.icon }}</div>
        <div class="title-display" style="font-size: 0.85rem; margin-bottom: 0.3rem">{{ c.title }}</div>
        <div style="font-size: 0.75rem; color: var(--t2)">{{ c.sub }}</div>
      </RouterLink>
    </div>
  </div>
</template>
