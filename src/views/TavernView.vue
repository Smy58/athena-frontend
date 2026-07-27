<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import shopApi from '../api/shop'
import SkeletonCard from '../components/SkeletonCard.vue'

const auth = useAuthStore()
const sections = ref([])
const pending = ref([])
const myPurchases = ref([])
const tab = ref(null)
const loading = ref(true)
const error = ref('')

const activeSection = computed(() => sections.value.find((s) => s.id === tab.value))
const itemPurchases = computed(() => myPurchases.value.filter((p) => p.kind === 'ITEM'))

async function load() {
  loading.value = true
  try {
    const [cat, pendingList, mine] = await Promise.all([
      shopApi.catalog(),
      shopApi.pendingPurchases(),
      shopApi.myPurchases(),
    ])
    sections.value = cat.sections
    pending.value = pendingList
    myPurchases.value = mine
    if (!tab.value && sections.value.length) tab.value = sections.value[0].id
  } finally {
    loading.value = false
  }
}

async function buyConsumable(item) {
  error.value = ''
  try {
    await shopApi.buyConsumable(item.id)
    await auth.refreshProfile()
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось купить товар'
  }
}

async function redeem(purchaseId) {
  await shopApi.redeem(purchaseId)
  await load()
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
        <h1 class="title-display" style="font-size: 1.4rem">🍺 Таверна</h1>
        <p style="font-size: 0.82rem; color: var(--t2); margin-top: 0.3rem">Напитки, еда и другие расходники</p>
      </div>
      <div class="card" style="padding: 0.6rem 1rem; font-size: 0.9rem">🪙 {{ auth.user?.finiki ?? 0 }} фиников</div>
    </div>

    <div v-if="error" class="alert alert-err">{{ error }}</div>

    <div v-if="loading" class="grid grid-cards">
      <SkeletonCard v-for="n in 7" :key="n" center :lines="1" button />
    </div>

    <template v-else>
      <div v-if="sections.length > 1" style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap">
        <button
          v-for="s in sections"
          :key="s.id"
          class="btn btn-sm"
          :class="tab === s.id ? 'btn-primary' : 'btn-outline'"
          @click="tab = s.id"
        >
          {{ s.icon }} {{ s.name }}
        </button>
      </div>

      <div v-if="activeSection" class="grid grid-cards">
        <div v-for="item in activeSection.items" :key="item.id" class="card" style="text-align: center">
          <div class="title-display" style="font-size: 0.9rem; margin-bottom: 0.4rem">{{ item.name }}</div>
          <div style="font-size: 0.78rem; color: var(--t2); margin-bottom: 0.8rem">🪙 {{ item.price }}</div>
          <button class="btn btn-primary btn-sm" @click="buyConsumable(item)">Купить</button>
        </div>
      </div>

      <div style="margin-top: 2rem">
        <div class="title-display" style="font-size: 0.85rem; margin-bottom: 0.75rem">Мои покупки к получению</div>
        <div v-if="pending.length === 0" class="empty-state">Пока нечего забирать</div>
        <div v-else class="grid grid-cards">
          <div v-for="p in pending" :key="p.id" class="card" style="text-align: center">
            <div class="title-display" style="font-size: 0.88rem; margin-bottom: 0.4rem">{{ p.name }}</div>
            <button class="btn btn-outline btn-sm" @click="redeem(p.id)">Отметить как полученное</button>
          </div>
        </div>
      </div>

      <div style="margin-top: 2rem">
        <div class="title-display" style="font-size: 0.85rem; margin-bottom: 0.75rem">История покупок</div>
        <div v-if="itemPurchases.length === 0" class="empty-state">Пока ничего не куплено</div>
        <div v-else class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Цена</th>
                <th>Получено</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in itemPurchases" :key="p.id">
                <td style="color: var(--t)">{{ p.name }}</td>
                <td>🪙 {{ p.price }}</td>
                <td>{{ p.redeemed ? '✅' : '⏳' }}</td>
                <td style="color: var(--t2); font-size: 0.85rem">{{ formatDate(p.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
