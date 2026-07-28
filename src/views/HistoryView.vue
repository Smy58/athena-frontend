<script setup>
import { ref, onMounted } from 'vue'
import questsApi from '../api/quests'
import reviewsApi from '../api/reviews'
import scheduleApi from '../api/schedule'
import SkeletonCard from '../components/SkeletonCard.vue'
import UserName from '../components/UserName.vue'
import { formatDate, formatWeekday } from '../utils/date'

const tab = ref('events')
const completedQuests = ref([])
const SCHEDULE_HISTORY = ref([])
const loading = ref(true)

const expandedId = ref(null)
const reviewsCache = ref({})
const draftRating = ref(0)
const draftText = ref('')
const saving = ref(false)

async function load() {
  loading.value = true
  try {
    const [quests, history] = await Promise.all([questsApi.completed(), scheduleApi.history()])
    completedQuests.value = quests
    SCHEDULE_HISTORY.value = history
  } finally {
    loading.value = false
  }
}

function reviewKey(type, id) {
  return `${type}:${id}`
}

async function toggleExpand(type, id) {
  const key = reviewKey(type, id)
  if (expandedId.value === key) {
    expandedId.value = null
    return
  }
  expandedId.value = key
  draftRating.value = 0
  draftText.value = ''
  if (!reviewsCache.value[key]) {
    const params = type === 'EVENT' ? { eventId: id } : { questId: id }
    reviewsCache.value[key] = await reviewsApi.find(type, params)
  }
}

async function submitReview(type, id) {
  if (draftRating.value < 1) return
  saving.value = true
  try {
    const payload = { type, rating: draftRating.value, text: draftText.value }
    if (type === 'EVENT') payload.eventId = id
    else payload.questId = id
    await reviewsApi.upsert(payload)
    const key = reviewKey(type, id)
    const params = type === 'EVENT' ? { eventId: id } : { questId: id }
    reviewsCache.value[key] = await reviewsApi.find(type, params)
    draftRating.value = 0
    draftText.value = ''
  } finally {
    saving.value = false
  }
}

function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <h1 class="title-display" style="font-size: 1.4rem; margin-bottom: 0.3rem">История <span class="accent">Клуба</span></h1>
    <p style="font-size: 0.82rem; color: var(--t2); margin-bottom: 1.25rem">Прошедшие игры, ивенты и завершённые задания</p>

    <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem">
      <button class="btn btn-sm" :class="tab === 'events' ? 'btn-primary' : 'btn-outline'" @click="tab = 'events'">📅 Игры и ивенты</button>
      <button class="btn btn-sm" :class="tab === 'quests' ? 'btn-primary' : 'btn-outline'" @click="tab = 'quests'">📋 Задания</button>
    </div>

    <div v-if="tab === 'events' && loading" class="grid" style="gap: 0.75rem">
      <SkeletonCard v-for="n in 5" :key="n" :lines="1" />
    </div>
    <div v-else-if="tab === 'events'" class="grid" style="gap: 0.75rem">
      <div v-for="e in SCHEDULE_HISTORY" :key="e.id" class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer" @click="toggleExpand('EVENT', e.id)">
          <div>
            <div class="title-display" style="font-size: 0.9rem">{{ e.name }}</div>
            <div style="font-size: 0.75rem; color: var(--t2); margin-top: 0.2rem">{{ e.meta }}</div>
          </div>
          <div style="font-size: 0.72rem; color: var(--t3)">{{ formatWeekday(e.date) }} {{ formatDate(e.date) }}</div>
        </div>

        <div v-if="expandedId === reviewKey('EVENT', e.id)" style="margin-top: 1rem; border-top: 1px solid var(--b); padding-top: 1rem">
          <div v-for="(r, i) in reviewsCache[reviewKey('EVENT', e.id)]" :key="i" style="margin-bottom: 0.6rem">
            <div style="font-size: 0.78rem; color: var(--pp)">{{ r.author?.name }} · {{ stars(r.rating) }}</div>
            <div style="font-size: 0.8rem; color: var(--t2)">{{ r.text }}</div>
          </div>
          <div style="display: flex; gap: 0.3rem; margin-bottom: 0.5rem">
            <span v-for="n in 5" :key="n" style="cursor: pointer; font-size: 1.1rem" :style="{ color: n <= draftRating ? 'var(--pp)' : 'var(--t3)' }" @click="draftRating = n">★</span>
          </div>
          <textarea v-model="draftText" placeholder="Оставь отзыв..." style="width: 100%; background: var(--bg3); border: 1px solid var(--b); border-radius: var(--r); padding: 0.6rem; color: var(--t); font-size: 0.85rem; margin-bottom: 0.5rem"></textarea>
          <button class="btn btn-primary btn-sm" :disabled="saving" @click="submitReview('EVENT', e.id)">Сохранить отзыв</button>
        </div>
      </div>
    </div>

    <div v-else>
      <div v-if="loading" class="grid" style="gap: 0.75rem">
        <SkeletonCard v-for="n in 3" :key="n" :lines="1" />
      </div>
      <div v-else-if="completedQuests.length === 0" class="empty-state">Пока нет завершённых заданий</div>
      <div v-else class="grid" style="gap: 0.75rem">
        <div v-for="q in completedQuests" :key="q.id" class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer" @click="toggleExpand('QUEST', q.id)">
            <div>
              <div class="title-display" style="font-size: 0.9rem">{{ q.title }}</div>
              <div style="font-size: 0.75rem; color: var(--t2); margin-top: 0.2rem">{{ formatDate(q.date) }} · {{ q.rewardValue }}</div>
            </div>
            <div style="font-size: 0.72rem; color: var(--t3)">✓ завершено</div>
          </div>

          <div v-if="expandedId === reviewKey('QUEST', q.id)" style="margin-top: 1rem; border-top: 1px solid var(--b); padding-top: 1rem">
            <div v-for="(r, i) in reviewsCache[reviewKey('QUEST', q.id)]" :key="i" style="margin-bottom: 0.6rem">
              <div style="font-size: 0.78rem; color: var(--pp)"><UserName :name="r.author?.name" :title-id="r.author?.activeTitle" /> · {{ stars(r.rating) }}</div>
              <div style="font-size: 0.8rem; color: var(--t2)">{{ r.text }}</div>
            </div>
            <div style="display: flex; gap: 0.3rem; margin-bottom: 0.5rem">
              <span v-for="n in 5" :key="n" style="cursor: pointer; font-size: 1.1rem" :style="{ color: n <= draftRating ? 'var(--pp)' : 'var(--t3)' }" @click="draftRating = n">★</span>
            </div>
            <textarea v-model="draftText" placeholder="Оставь отзыв..." style="width: 100%; background: var(--bg3); border: 1px solid var(--b); border-radius: var(--r); padding: 0.6rem; color: var(--t); font-size: 0.85rem; margin-bottom: 0.5rem"></textarea>
            <button class="btn btn-primary btn-sm" :disabled="saving" @click="submitReview('QUEST', q.id)">Сохранить отзыв</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
