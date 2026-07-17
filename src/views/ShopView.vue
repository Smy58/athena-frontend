<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import shopApi from '../api/shop'
import SkeletonCard from '../components/SkeletonCard.vue'

const auth = useAuthStore()
const catalog = ref({ titles: [], sections: [] })
const pending = ref([])
const tab = ref('titles')
const loading = ref(true)
const error = ref('')

const activeSection = computed(() => catalog.value.sections.find((s) => s.id === tab.value))

async function load() {
  loading.value = true
  try {
    const [cat, purchases] = await Promise.all([shopApi.catalog(), shopApi.pendingPurchases()])
    catalog.value = cat
    pending.value = purchases
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
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось купить звание'
  }
}

async function selectTitle(titleId) {
  await shopApi.selectTitle(titleId)
  await auth.refreshProfile()
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

onMounted(load)
</script>

<template>
  <div class="wrap">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem">
      <div>
        <h1 class="title-display" style="font-size: 1.4rem">Магазин <span class="accent">Клуба</span></h1>
        <p style="font-size: 0.82rem; color: var(--t2); margin-top: 0.3rem">Трать финики на звания, зелья и еду</p>
      </div>
      <div class="card" style="padding: 0.6rem 1rem; font-size: 0.9rem">🪙 {{ auth.user?.finiki ?? 0 }} фиников</div>
    </div>

    <div v-if="error" class="alert alert-err">{{ error }}</div>

    <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap">
      <button class="btn btn-sm" :class="tab === 'titles' ? 'btn-primary' : 'btn-outline'" @click="tab = 'titles'">🏷️ Звания</button>
      <button
        v-for="s in catalog.sections"
        :key="s.id"
        class="btn btn-sm"
        :class="tab === s.id ? 'btn-primary' : 'btn-outline'"
        @click="tab = s.id"
      >
        {{ s.icon }} {{ s.name }}
      </button>
    </div>

    <div v-if="loading" class="grid grid-cards">
      <SkeletonCard v-for="n in 7" :key="n" center :lines="1" button />
    </div>

    <template v-else>
      <div v-if="tab === 'titles'" class="grid grid-cards">
        <div v-for="t in catalog.titles" :key="t.id" class="card" style="text-align: center">
          <div class="title-display" style="font-size: 0.9rem; margin-bottom: 0.4rem">{{ t.name }}</div>
          <div style="font-size: 0.78rem; color: var(--t2); margin-bottom: 0.8rem">🪙 {{ t.price }}</div>
          <button v-if="!owned(t.id)" class="btn btn-primary btn-sm" @click="buyTitle(t)">Купить</button>
          <button v-else-if="auth.user?.activeTitle === t.id" class="btn btn-outline btn-sm" disabled>✓ Активно</button>
          <button v-else class="btn btn-outline btn-sm" @click="selectTitle(t.id)">Сделать активным</button>
        </div>
      </div>

      <div v-else-if="activeSection" class="grid grid-cards">
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
    </template>
  </div>
</template>
