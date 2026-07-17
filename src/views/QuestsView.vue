<script setup>
import { ref, onMounted } from 'vue'
import questsApi from '../api/quests'
import { useAuthStore } from '../stores/auth'
import SkeletonCard from '../components/SkeletonCard.vue'
import { formatDate } from '../utils/date'

const auth = useAuthStore()
const quests = ref([])
const loading = ref(true)
const error = ref('')
const formOpen = ref(false)
const saving = ref(false)

const form = ref({
  title: '',
  description: '',
  date: '',
  time: '',
  rewardType: 'GOLD',
  rewardValue: '',
})

async function load() {
  loading.value = true
  try {
    quests.value = await questsApi.active()
  } catch (e) {
    error.value = 'Не удалось загрузить задания'
  } finally {
    loading.value = false
  }
}

function isSignedUp(quest) {
  return quest.signups?.some((s) => s.userId === auth.user?.id)
}

function isOwner(quest) {
  return quest.createdById === auth.user?.id
}

async function toggleSignup(quest) {
  await questsApi.toggleSignup(quest.id)
  await load()
}

async function complete(quest) {
  await questsApi.complete(quest.id)
  await load()
}

async function remove(quest) {
  if (!confirm('Удалить это задание?')) return
  await questsApi.remove(quest.id)
  await load()
}

async function submit() {
  error.value = ''
  if (!form.value.title || !form.value.date || !form.value.time || !form.value.rewardValue) {
    error.value = 'Заполни название, дату, время и награду'
    return
  }
  saving.value = true
  try {
    await questsApi.create(form.value)
    form.value = { title: '', description: '', date: '', time: '', rewardType: 'GOLD', rewardValue: '' }
    formOpen.value = false
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось создать задание'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem">
      <div>
        <h1 class="title-display" style="font-size: 1.4rem">Доска <span class="accent">Заданий</span></h1>
        <p style="font-size: 0.82rem; color: var(--t2); margin-top: 0.3rem">Записывайся на игру и получай награду</p>
      </div>
      <button class="btn btn-primary" @click="formOpen = !formOpen">{{ formOpen ? 'Отменить' : '+ Создать задание' }}</button>
    </div>

    <div v-if="formOpen" class="auth-card" style="max-width: 480px; margin: 0 auto 1.5rem">
      <div v-if="error" class="alert alert-err">{{ error }}</div>
      <div class="field"><label>Название задания</label><input v-model="form.title" placeholder="Зачистка старой шахты" /></div>
      <div class="field"><label>Описание</label><textarea v-model="form.description" placeholder="Опиши, что нужно сделать..."></textarea></div>
      <div class="grid" style="grid-template-columns: 1fr 1fr">
        <div class="field"><label>Дата</label><input v-model="form.date" type="date" /></div>
        <div class="field"><label>Время</label><input v-model="form.time" placeholder="напр. 18:00" /></div>
      </div>
      <div class="field">
        <label>Тип награды</label>
        <select v-model="form.rewardType">
          <option value="GOLD">💰 Золото</option>
          <option value="ARTIFACT">🏺 Артефакт</option>
        </select>
      </div>
      <div class="field"><label>Награда</label><input v-model="form.rewardValue" placeholder="напр. 150 золотых" /></div>
      <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="saving" @click="submit">
        {{ saving ? 'Публикуем...' : 'Опубликовать задание ✦' }}
      </button>
    </div>

    <div v-if="loading" class="grid grid-cards">
      <SkeletonCard v-for="n in 6" :key="n" :lines="3" />
    </div>
    <div v-else-if="quests.length === 0" class="empty-state">
      <div style="font-size: 2.5rem; margin-bottom: 1rem">📋</div>
      <p>Пока нет заданий на доске.</p>
    </div>

    <div v-else class="grid grid-cards">
      <div v-for="q in quests" :key="q.id" class="card">
        <div style="display: flex; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.5rem">
          <div class="title-display" style="font-size: 0.95rem">{{ q.title }}</div>
          <div style="font-size: 0.78rem; color: var(--pp); white-space: nowrap">
            {{ q.rewardType === 'ARTIFACT' ? '🏺' : '💰' }} {{ q.rewardValue }}
          </div>
        </div>
        <div style="font-size: 0.8rem; color: var(--t2); margin-bottom: 0.6rem">{{ q.description }}</div>
        <div style="font-size: 0.75rem; color: var(--t3); margin-bottom: 0.8rem">
          📅 {{ formatDate(q.date) }} · 🕐 {{ q.time }} · автор {{ q.createdBy?.name }}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap">
          <button class="btn btn-sm" :class="isSignedUp(q) ? 'btn-outline' : 'btn-primary'" @click="toggleSignup(q)">
            {{ isSignedUp(q) ? '✓ Записан' : 'Записаться' }}
          </button>
          <span style="font-size: 0.72rem; color: var(--t3)">Записалось: {{ q.signups?.length ?? 0 }}</span>
        </div>
        <div v-if="isOwner(q)" style="display: flex; gap: 0.5rem; margin-top: 0.6rem">
          <button class="btn btn-outline btn-sm" @click="complete(q)">Завершить</button>
          <button class="btn btn-danger btn-sm" @click="remove(q)">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>
