<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import supportApi from '../api/support'
import SkeletonCard from '../components/SkeletonCard.vue'
import UserName from '../components/UserName.vue'

const auth = useAuthStore()
const view = ref('list')
const topics = ref([])
const loading = ref(true)
const error = ref('')

const form = ref({ title: '', category: 'PROBLEM', message: '' })
const saving = ref(false)

const activeTopic = ref(null)
const chatInput = ref('')
const sending = ref(false)

async function loadTopics() {
  loading.value = true
  try {
    topics.value = await supportApi.list()
  } finally {
    loading.value = false
  }
}

function showList() {
  view.value = 'list'
  activeTopic.value = null
  loadTopics()
}

function showForm() {
  error.value = ''
  form.value = { title: '', category: 'PROBLEM', message: '' }
  view.value = 'form'
}

async function submitTopic() {
  error.value = ''
  if (!form.value.title || !form.value.message) {
    error.value = 'Заполни тему и сообщение'
    return
  }
  saving.value = true
  try {
    const topic = await supportApi.create(form.value)
    activeTopic.value = topic
    view.value = 'chat'
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось создать тему'
  } finally {
    saving.value = false
  }
}

async function openTopic(id) {
  activeTopic.value = await supportApi.get(id)
  view.value = 'chat'
}

async function sendMessage() {
  if (!chatInput.value.trim()) return
  sending.value = true
  try {
    activeTopic.value = await supportApi.addMessage(activeTopic.value.id, chatInput.value.trim())
    chatInput.value = ''
  } finally {
    sending.value = false
  }
}

onMounted(loadTopics)
</script>

<template>
  <div class="wrap">
    <template v-if="view === 'list'">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem">
        <div>
          <h1 class="title-display" style="font-size: 1.4rem">Обратная <span class="accent">связь</span></h1>
          <p style="font-size: 0.82rem; color: var(--t2); margin-top: 0.3rem">Проблемы и предложения — открыто для всех участников клуба</p>
        </div>
        <button class="btn btn-primary" @click="showForm">+ Создать тему</button>
      </div>

      <div v-if="loading" class="grid grid-cards">
        <SkeletonCard v-for="n in 6" :key="n" :lines="2" />
      </div>
      <div v-else-if="topics.length === 0" class="empty-state">Пока нет тем — начни первым</div>
      <div v-else class="grid grid-cards">
        <div v-for="t in topics" :key="t.id" class="card" style="cursor: pointer" @click="openTopic(t.id)">
          <div style="font-size: 0.7rem; color: var(--pp); margin-bottom: 0.4rem">
            {{ t.category === 'PROBLEM' ? '🐛 Проблема' : '💡 Предложение' }}
          </div>
          <div class="title-display" style="font-size: 0.92rem; margin-bottom: 0.4rem">{{ t.title }}</div>
          <div style="font-size: 0.75rem; color: var(--t2)"><UserName :name="t.createdBy?.name" :title-id="t.createdBy?.activeTitle" /> · {{ t.messages?.length ?? 0 }} сообщений</div>
        </div>
      </div>
    </template>

    <template v-else-if="view === 'form'">
      <button class="btn btn-ghost" style="margin-bottom: 1rem" @click="showList">← Назад к списку</button>
      <div class="auth-card" style="max-width: 480px; margin: 0 auto">
        <h1 class="title-display" style="text-align: center; font-size: 1.2rem; margin-bottom: 1.5rem">Новая тема</h1>
        <div v-if="error" class="alert alert-err">{{ error }}</div>
        <div class="field"><label>Тема</label><input v-model="form.title" placeholder="Кратко опиши суть" /></div>
        <div class="field">
          <label>Тип</label>
          <select v-model="form.category">
            <option value="PROBLEM">🐛 Проблема</option>
            <option value="SUGGESTION">💡 Предложение</option>
          </select>
        </div>
        <div class="field"><label>Сообщение</label><textarea v-model="form.message" placeholder="Опиши подробнее..." style="min-height: 110px"></textarea></div>
        <div style="display: flex; gap: 0.6rem">
          <button class="btn btn-primary btn-sm" style="flex: 1; justify-content: center" :disabled="saving" @click="submitTopic">Создать</button>
          <button class="btn btn-outline btn-sm" style="flex: 1; justify-content: center" @click="showList">Отменить</button>
        </div>
      </div>
    </template>

    <template v-else-if="view === 'chat' && activeTopic">
      <button class="btn btn-ghost" style="margin-bottom: 1rem" @click="showList">← Назад к списку</button>
      <div style="max-width: 560px; margin: 0 auto">
        <div style="margin-bottom: 1rem">
          <span style="font-size: 0.75rem; color: var(--pp)">{{ activeTopic.category === 'PROBLEM' ? '🐛 Проблема' : '💡 Предложение' }}</span>
          <div class="title-display" style="font-size: 1.1rem; margin-top: 0.3rem">{{ activeTopic.title }}</div>
        </div>
        <div class="card" style="margin-bottom: 1rem; max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem">
          <div v-for="(m, i) in activeTopic.messages" :key="i">
            <div style="font-size: 0.72rem; color: var(--t3); margin-bottom: 0.2rem"><UserName :name="m.author?.name" :title-id="m.author?.activeTitle" /></div>
            <div style="font-size: 0.85rem; color: var(--t); background: var(--bg2); border-radius: var(--r); padding: 0.6rem 0.8rem">{{ m.text }}</div>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem">
          <textarea
            v-model="chatInput"
            placeholder="Написать сообщение..."
            rows="1"
            style="flex: 1; background: var(--bg3); border: 1px solid var(--b); border-radius: var(--r); padding: 0.65rem; color: var(--t); font-size: 0.85rem; resize: vertical"
            @keydown.enter.exact.prevent="sendMessage"
          ></textarea>
          <button class="btn btn-primary btn-sm" :disabled="sending" @click="sendMessage">Отправить</button>
        </div>
      </div>
    </template>
  </div>
</template>
