<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import shopApi from '../api/shop'
import SkeletonCard from '../components/SkeletonCard.vue'

const purchases = ref([])
const loading = ref(true)

const itemPurchases = computed(() => purchases.value.filter((p) => p.kind === 'ITEM'))

async function load() {
  loading.value = true
  try {
    purchases.value = await shopApi.myPurchases()
  } finally {
    loading.value = false
  }
}

function statusClass(p) {
  if (p.cancelled) return 'status-cancelled'
  if (p.redeemed) return 'status-done'
  return 'status-pending'
}

function statusLabel(p) {
  if (p.cancelled) return '❌ Отменено'
  if (p.redeemed) return '✅ Получено'
  return '⏳ Ожидает выдачи'
}

function formatDateTime(d) {
  return new Date(d).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <RouterLink to="/tavern" style="font-size: 0.8rem; color: var(--t2); display: inline-block; margin-bottom: 1rem">← Костер и Котел</RouterLink>
    <h1 class="title-display" style="font-size: 1.4rem; margin-bottom: 0.3rem">📜 История заказов</h1>
    <p style="font-size: 0.82rem; color: var(--t2); margin-bottom: 1.5rem">Все напитки и еда, которые ты заказал в «Костер и Котел»</p>

    <div v-if="loading" class="grid" style="gap: 0.75rem">
      <SkeletonCard v-for="n in 4" :key="n" :lines="1" />
    </div>
    <div v-else-if="itemPurchases.length === 0" class="empty-state">Пока ничего не куплено</div>
    <div v-else class="grid" style="gap: 0.75rem">
      <div v-for="p in itemPurchases" :key="p.id" class="card history-row">
        <div class="history-row-top">
          <div class="title-display history-row-name">{{ p.name }} <span style="color: var(--t2); font-weight: normal">×{{ p.quantity }}</span></div>
          <span class="status-pill" :class="statusClass(p)">{{ statusLabel(p) }}</span>
        </div>
        <div class="history-row-meta">
          <span class="price">🪙 {{ p.price * p.quantity }}</span>
          <span class="dot">·</span>
          <span>{{ formatDateTime(p.createdAt) }}</span>
        </div>
        <div v-if="p.comment" style="font-size: 0.8rem; color: var(--t2); font-style: italic">💬 {{ p.comment }}</div>
      </div>
    </div>
  </div>
</template>
