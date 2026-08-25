<script setup>
import { ref, computed, onMounted } from 'vue'
import mastersApi from '../api/masters'
import scheduleApi from '../api/schedule'
import SkeletonCard from '../components/SkeletonCard.vue'
import { formatDate } from '../utils/date'

const MASTERS = ref([])
const loading = ref(true)
const selected = ref(null)
const systemFilter = ref('all')
const genreFilter = ref('all')
const beginnersOnly = ref(false)

const masterGames = ref([])
const masterGamesLoading = ref(false)

const upcomingMasterGames = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return masterGames.value.filter((g) => g.date.slice(0, 10) >= today)
})
const pastMasterGames = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return masterGames.value.filter((g) => g.date.slice(0, 10) < today)
})

async function openMaster(m) {
  selected.value = m
  masterGames.value = []
  masterGamesLoading.value = true
  try {
    masterGames.value = await scheduleApi.gamesByMaster(m.id)
  } finally {
    masterGamesLoading.value = false
  }
}

const systems = computed(() => ['all', ...new Set(MASTERS.value.flatMap((m) => m.systems))])
const genres = computed(() => ['all', ...new Set(MASTERS.value.flatMap((m) => m.genres))])

const filtered = computed(() =>
  MASTERS.value.filter((m) => {
    if (systemFilter.value !== 'all' && !m.systems.includes(systemFilter.value)) return false
    if (genreFilter.value !== 'all' && !m.genres.includes(genreFilter.value)) return false
    if (beginnersOnly.value && !m.beginnerFriendly) return false
    return true
  }),
)

onMounted(async () => {
  try {
    MASTERS.value = await mastersApi.list()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="wrap">
    <template v-if="!selected">
      <h1 class="title-display" style="font-size: 1.4rem; margin-bottom: 0.3rem">Каталог <span class="accent">мастеров</span></h1>
      <p style="font-size: 0.82rem; color: var(--t2); margin-bottom: 1.25rem">Выбирай по стилю, жанрам и отзывам</p>

      <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 1.25rem">
        <select v-model="systemFilter" style="background: var(--bg3); border: 1px solid var(--b); border-radius: var(--r); padding: 0.5rem 0.75rem; color: var(--t); font-size: 0.82rem">
          <option value="all">Система: все</option>
          <option v-for="s in systems.filter((x) => x !== 'all')" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="genreFilter" style="background: var(--bg3); border: 1px solid var(--b); border-radius: var(--r); padding: 0.5rem 0.75rem; color: var(--t); font-size: 0.82rem">
          <option value="all">Жанр: все</option>
          <option v-for="g in genres.filter((x) => x !== 'all')" :key="g" :value="g">{{ g }}</option>
        </select>
        <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; color: var(--t2)">
          <input type="checkbox" v-model="beginnersOnly" /> Подходит новичкам
        </label>
      </div>

      <div v-if="loading" class="grid grid-cards">
        <SkeletonCard v-for="n in 6" :key="n" icon :lines="2" />
      </div>
      <div v-else class="grid grid-cards">
        <div v-for="m in filtered" :key="m.id" class="card" style="cursor: pointer" @click="openMaster(m)">
          <div style="font-size: 1.6rem; margin-bottom: 0.5rem">{{ m.icon }}</div>
          <div class="title-display" style="font-size: 0.95rem; margin-bottom: 0.2rem">{{ m.name }}</div>
          <div style="font-size: 0.72rem; color: var(--pp); margin-bottom: 0.5rem">{{ m.status }}</div>
          <div style="font-size: 0.78rem; color: var(--t2)">{{ m.shortDescription }}</div>
          <div style="font-size: 0.7rem; color: var(--t3); margin-top: 0.5rem">🎲 {{ m.gamesHostedCount }} игр проведено</div>
        </div>
      </div>
    </template>

    <template v-else>
      <button class="btn btn-ghost" style="margin-bottom: 1rem" @click="selected = null">← Назад к списку</button>
      <div class="auth-card" style="max-width: 560px; margin: 0 auto">
        <div style="text-align: center; margin-bottom: 1.25rem">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem">{{ selected.icon }}</div>
          <div class="title-display" style="font-size: 1.2rem">{{ selected.name }}</div>
          <div style="font-size: 0.78rem; color: var(--pp); margin-top: 0.3rem">{{ selected.status }}</div>
        </div>
        <div style="font-size: 0.85rem; color: var(--t2); line-height: 1.7; margin-bottom: 1rem">{{ selected.fullDescription }}</div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem">
          <span v-for="tag in [...selected.systems, ...selected.genres, ...selected.styleTags]" :key="tag" style="font-size: 0.7rem; color: var(--pp); background: rgba(123,47,190,.15); padding: 0.3rem 0.6rem; border-radius: 999px">{{ tag }}</span>
        </div>
        <div style="font-size: 0.78rem; color: var(--t3); margin-bottom: 1rem">Опыт: {{ selected.experienceLevel }} · {{ selected.gamesHostedCount }} игр проведено</div>

        <div v-if="masterGamesLoading" style="font-size: 0.8rem; color: var(--t3)">Загрузка игр...</div>
        <template v-else>
          <template v-if="upcomingMasterGames.length">
            <div class="title-display" style="font-size: 0.82rem; margin-bottom: 0.6rem">Предстоящие игры</div>
            <div v-for="g in upcomingMasterGames" :key="g.id" style="font-size: 0.8rem; color: var(--t2); margin-bottom: 0.3rem">
              {{ g.title }} — {{ formatDate(g.date) }}
            </div>
          </template>
          <template v-if="pastMasterGames.length">
            <div class="title-display" style="font-size: 0.82rem; margin: 1rem 0 0.6rem">Прошедшие игры</div>
            <div v-for="g in pastMasterGames" :key="g.id" style="font-size: 0.8rem; color: var(--t2); margin-bottom: 0.3rem">
              {{ g.title }} — {{ formatDate(g.date) }}
            </div>
          </template>
          <div v-if="!upcomingMasterGames.length && !pastMasterGames.length" style="font-size: 0.8rem; color: var(--t3)">Пока нет игр в расписании</div>
        </template>
      </div>
    </template>
  </div>
</template>
