<script setup>
import { ref, computed, onMounted } from 'vue'
import scheduleApi from '../api/schedule'
import { gameSeats, levelLabel } from '../utils/schedule'
import SkeletonCard from '../components/SkeletonCard.vue'
import { useAuthStore } from '../stores/auth'
import { formatDate } from '../utils/date'

const auth = useAuthStore()
const GAMES = ref([])
const GAME_FORMATS = ref([])
const GAME_SYSTEMS = ref([])
const loading = ref(true)
const selected = ref(null)
const formatFilter = ref('all')
const systemFilter = ref('all')
const beginnersOnly = ref(false)
const seatsOnly = ref(false)
const signingUp = ref(false)
const signupError = ref('')

const filtered = computed(() =>
  GAMES.value.filter((g) => {
    if (formatFilter.value !== 'all' && g.format !== formatFilter.value) return false
    if (systemFilter.value !== 'all' && g.gameSystem !== systemFilter.value) return false
    if (beginnersOnly.value && !g.forBeginners) return false
    if (seatsOnly.value && g.totalSeats - g.bookedSeats <= 0) return false
    return true
  }),
)

function isSignedUp(game) {
  return game.signups?.some((s) => s.userId === auth.user?.id)
}

async function loadGames() {
  GAMES.value = await scheduleApi.games()
  if (selected.value) {
    selected.value = GAMES.value.find((g) => g.id === selected.value.id) ?? null
  }
}

async function toggleSignup(game) {
  signupError.value = ''
  signingUp.value = true
  try {
    await scheduleApi.toggleSignup(game.id)
    await loadGames()
  } catch (e) {
    signupError.value = e.response?.data?.message || 'Не удалось записаться'
  } finally {
    signingUp.value = false
  }
}

onMounted(async () => {
  try {
    const [games, meta] = await Promise.all([scheduleApi.games(), scheduleApi.meta()])
    GAMES.value = games
    GAME_FORMATS.value = meta.formats
    GAME_SYSTEMS.value = meta.systems
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="wrap">
    <template v-if="!selected">
      <h1 class="title-display" style="font-size: 1.4rem; margin-bottom: 0.3rem">Расписание <span class="accent">игр</span></h1>
      <p style="font-size: 0.82rem; color: var(--t2); margin-bottom: 1.25rem">Выбирай, фильтруй, записывайся</p>

      <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 1.25rem">
        <select v-model="formatFilter" style="background: var(--bg3); border: 1px solid var(--b); border-radius: var(--r); padding: 0.5rem 0.75rem; color: var(--t); font-size: 0.82rem">
          <option value="all">Формат: все</option>
          <option v-for="f in GAME_FORMATS" :key="f" :value="f">{{ f }}</option>
        </select>
        <select v-model="systemFilter" style="background: var(--bg3); border: 1px solid var(--b); border-radius: var(--r); padding: 0.5rem 0.75rem; color: var(--t); font-size: 0.82rem">
          <option value="all">Система: все</option>
          <option v-for="s in GAME_SYSTEMS" :key="s" :value="s">{{ s }}</option>
        </select>
        <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; color: var(--t2)">
          <input type="checkbox" v-model="beginnersOnly" /> Только новичкам
        </label>
        <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; color: var(--t2)">
          <input type="checkbox" v-model="seatsOnly" /> Только с местами
        </label>
      </div>

      <div v-if="loading" class="grid grid-cards">
        <SkeletonCard v-for="n in 6" :key="n" :lines="2" />
      </div>
      <div v-else class="grid grid-cards">
        <div v-for="g in filtered" :key="g.id" class="card" style="cursor: pointer" @click="selected = g">
          <img
            v-if="g.imageUrl"
            :src="g.imageUrl"
            alt=""
            style="width: 100%; height: 140px; object-fit: cover; border-radius: var(--r); margin-bottom: 0.75rem"
          />
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem">
            <span style="font-size: 0.7rem; color: var(--pp)">{{ g.format }}</span>
            <span style="font-size: 0.7rem" :style="{ color: gameSeats(g).color }">{{ gameSeats(g).label }}</span>
          </div>
          <div class="title-display" style="font-size: 0.92rem; margin-bottom: 0.3rem">{{ g.title }}</div>
          <div style="font-size: 0.78rem; color: var(--t2); margin-bottom: 0.5rem">{{ g.shortDescription }}</div>
          <div style="font-size: 0.72rem; color: var(--t3)">
            {{ g.master.icon }} {{ g.master.name }} · 📅 {{ formatDate(g.date) }} · 🕐 {{ g.startTime }}–{{ g.endTime }} · {{ levelLabel(g) }}
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <button class="btn btn-ghost" style="margin-bottom: 1rem" @click="selected = null">← Назад к списку</button>
      <div class="auth-card" style="max-width: 520px; margin: 0 auto">
        <img
          v-if="selected.imageUrl"
          :src="selected.imageUrl"
          alt=""
          style="width: 100%; max-height: 260px; object-fit: cover; border-radius: var(--r); margin-bottom: 1rem"
        />
        <div style="text-align: center; margin-bottom: 1.25rem">
          <span style="font-size: 0.72rem; color: var(--pp)">{{ selected.format }} · {{ selected.gameSystem }}</span>
          <div class="title-display" style="font-size: 1.15rem; margin-top: 0.3rem">{{ selected.title }}</div>
          <div style="font-size: 0.78rem; color: var(--t2); margin-top: 0.3rem">{{ selected.master.icon }} Мастер: {{ selected.master.name }}</div>
        </div>
        <div style="font-size: 0.85rem; color: var(--t2); line-height: 1.7; margin-bottom: 1rem">{{ selected.shortDescription }}</div>
        <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 1rem">
          <div class="card" style="padding: 0.75rem"><div style="font-size: 0.68rem; color: var(--t3)">Дата и время</div><div style="font-size: 0.85rem">{{ formatDate(selected.date) }} · {{ selected.startTime }}–{{ selected.endTime }}</div></div>
          <div class="card" style="padding: 0.75rem"><div style="font-size: 0.68rem; color: var(--t3)">Уровень</div><div style="font-size: 0.85rem">{{ levelLabel(selected) }}</div></div>
          <div class="card" style="padding: 0.75rem"><div style="font-size: 0.68rem; color: var(--t3)">Места</div><div style="font-size: 0.85rem" :style="{ color: gameSeats(selected).color }">{{ gameSeats(selected).label }}</div></div>
          <div class="card" style="padding: 0.75rem"><div style="font-size: 0.68rem; color: var(--t3)">Стоимость</div><div style="font-size: 0.85rem">{{ selected.price ? selected.price + ' ' + selected.currency : 'Бесплатно' }}</div></div>
        </div>
        <div style="font-size: 0.75rem; color: var(--t3); margin-bottom: 1rem">Возрастное ограничение: {{ selected.ageLimit }}</div>

        <div v-if="signupError" class="alert alert-err">{{ signupError }}</div>
        <button
          class="btn btn-sm"
          :class="isSignedUp(selected) ? 'btn-outline' : 'btn-primary'"
          style="width: 100%; justify-content: center"
          :disabled="signingUp || (!isSignedUp(selected) && selected.totalSeats - selected.bookedSeats <= 0)"
          @click="toggleSignup(selected)"
        >
          {{ signingUp ? 'Сохраняем...' : isSignedUp(selected) ? '✓ Записан — отменить запись' : 'Записаться' }}
        </button>
      </div>
    </template>
  </div>
</template>
