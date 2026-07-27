<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import shopApi from '../api/shop'
import SkeletonCard from '../components/SkeletonCard.vue'

const auth = useAuthStore()
const titleSections = ref([])
const myPurchases = ref([])
const tab = ref(null)
const loading = ref(true)
const error = ref('')

const activeSection = computed(() => titleSections.value.find((s) => s.id === tab.value))
const titlePurchases = computed(() => myPurchases.value.filter((p) => p.kind === 'TITLE'))

async function load() {
  loading.value = true
  try {
    const [cat, mine] = await Promise.all([shopApi.catalog(), shopApi.myPurchases()])
    titleSections.value = cat.titleSections
    myPurchases.value = mine
    if (!tab.value && titleSections.value.length) tab.value = titleSections.value[0].id
  } finally {
    loading.value = false
  }
}

function owned(titleId) {
  return auth.user?.titles?.includes(titleId)
}

async function buyTitle(title) {
  error.value = ''
  try {
    await shopApi.buyTitle(title.id)
    await auth.refreshProfile()
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось купить звание'
  }
}

async function selectTitle(titleId) {
  await shopApi.selectTitle(titleId)
  await auth.refreshProfile()
}

function formatDate(d) {
  return new Date(d).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem">
      <div>
        <h1 class="title-display" style="font-size: 1.4rem">🛍️ Магазин</h1>
        <p style="font-size: 0.82rem; color: var(--t2); margin-top: 0.3rem">Звания и другие покупки навсегда</p>
      </div>
      <div class="card" style="padding: 0.6rem 1rem; font-size: 0.9rem">🪙 {{ auth.user?.finiki ?? 0 }} фиников</div>
    </div>

    <div v-if="error" class="alert alert-err">{{ error }}</div>

    <div v-if="loading" class="grid grid-cards">
      <SkeletonCard v-for="n in 7" :key="n" center :lines="1" button />
    </div>

    <template v-else>
      <div v-if="titleSections.length > 1" style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap">
        <button
          v-for="s in titleSections"
          :key="s.id"
          class="btn btn-sm"
          :class="tab === s.id ? 'btn-primary' : 'btn-outline'"
          @click="tab = s.id"
        >
          {{ s.icon }} {{ s.name }}
        </button>
      </div>

      <div v-if="activeSection" class="grid grid-cards">
        <div v-for="t in activeSection.titles" :key="t.id" class="card" style="text-align: center">
          <div class="title-display" style="font-size: 0.9rem; margin-bottom: 0.4rem">{{ t.name }}</div>
          <div style="font-size: 0.78rem; color: var(--t2); margin-bottom: 0.8rem">🪙 {{ t.price }}</div>
          <button v-if="!owned(t.id)" class="btn btn-primary btn-sm" @click="buyTitle(t)">Купить</button>
          <button v-else-if="auth.user?.activeTitle === t.id" class="btn btn-outline btn-sm" disabled>✓ Активно</button>
          <button v-else class="btn btn-outline btn-sm" @click="selectTitle(t.id)">Сделать активным</button>
        </div>
      </div>

      <div style="margin-top: 2rem">
        <div class="title-display" style="font-size: 0.85rem; margin-bottom: 0.75rem">История покупок</div>
        <div v-if="titlePurchases.length === 0" class="empty-state">Пока ничего не куплено</div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Звание</th>
                <th>Цена</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in titlePurchases" :key="p.id">
                <td style="color: var(--t)">{{ p.name }}</td>
                <td>🪙 {{ p.price }}</td>
                <td style="color: var(--t2); font-size: 0.85rem">{{ formatDate(p.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
