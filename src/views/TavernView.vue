<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import shopApi from '../api/shop'
import SkeletonCard from '../components/SkeletonCard.vue'

const auth = useAuthStore()
const sections = ref([])
const myPurchases = ref([])
const tab = ref(null)
const loading = ref(true)
const error = ref('')

const cart = ref({}) // itemId -> quantity
const paymentMethod = ref('finiki')
const checkingOut = ref(false)

const activeSection = computed(() => sections.value.find((s) => s.id === tab.value))
const itemPurchases = computed(() => myPurchases.value.filter((p) => p.kind === 'ITEM'))
const allItems = computed(() => sections.value.flatMap((s) => s.items))

const cartLines = computed(() =>
  Object.entries(cart.value)
    .filter(([, qty]) => qty > 0)
    .map(([itemId, qty]) => ({ item: allItems.value.find((i) => i.id === itemId), qty }))
    .filter((l) => l.item),
)
const cartTotal = computed(() => cartLines.value.reduce((sum, l) => sum + l.item.price * l.qty, 0))
const cartCount = computed(() => cartLines.value.reduce((sum, l) => sum + l.qty, 0))

async function load() {
  loading.value = true
  try {
    const [cat, mine] = await Promise.all([shopApi.catalog(), shopApi.myPurchases()])
    sections.value = cat.sections
    myPurchases.value = mine
    if (!tab.value && sections.value.length) tab.value = sections.value[0].id
  } finally {
    loading.value = false
  }
}

function qty(itemId) {
  return cart.value[itemId] || 0
}

function inc(item) {
  cart.value[item.id] = qty(item.id) + 1
}

function dec(item) {
  const next = qty(item.id) - 1
  if (next <= 0) delete cart.value[item.id]
  else cart.value[item.id] = next
}

async function checkout() {
  error.value = ''
  if (cartLines.value.length === 0) return
  if (paymentMethod.value !== 'finiki') {
    error.value = 'Этот способ оплаты пока недоступен'
    return
  }
  checkingOut.value = true
  try {
    await shopApi.checkout(cartLines.value.map((l) => ({ itemId: l.item.id, quantity: l.qty })), 'FINIKI')
    cart.value = {}
    await auth.refreshProfile()
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось оформить заказ'
  } finally {
    checkingOut.value = false
  }
}

function formatDate(d) {
  return new Date(d).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(load)
</script>

<template>
  <div class="wrap" :style="{ paddingBottom: cartCount > 0 ? '7rem' : null }">
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
          <div style="display: flex; align-items: center; justify-content: center; gap: 0.6rem">
            <button class="btn btn-outline btn-sm" style="width: 2rem; padding: 0" :disabled="qty(item.id) === 0" @click="dec(item)">−</button>
            <span style="min-width: 1.5rem; font-weight: 600">{{ qty(item.id) }}</span>
            <button class="btn btn-primary btn-sm" style="width: 2rem; padding: 0" @click="inc(item)">+</button>
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
                <th>Кол-во</th>
                <th>Цена</th>
                <th>Получено</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in itemPurchases" :key="p.id">
                <td style="color: var(--t)">{{ p.name }}</td>
                <td>×{{ p.quantity }}</td>
                <td>🪙 {{ p.price * p.quantity }}</td>
                <td>{{ p.cancelled ? '❌ отменён' : p.redeemed ? '✅ выдано' : '⏳ ожидает выдачи' }}</td>
                <td style="color: var(--t2); font-size: 0.85rem">{{ formatDate(p.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-if="cartCount > 0" class="card" style="position: fixed; left: 1rem; right: 1rem; bottom: 1rem; max-width: 640px; margin: 0 auto; z-index: 50">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap">
        <div style="font-size: 0.85rem">
          <div v-for="l in cartLines" :key="l.item.id" style="color: var(--t2)">{{ l.item.name }} ×{{ l.qty }}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap">
          <label style="display: flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; cursor: pointer">
            <input type="radio" value="finiki" v-model="paymentMethod" /> 🪙 Финики
          </label>
          <label style="display: flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; color: var(--t2)">
            <input type="radio" value="card" v-model="paymentMethod" disabled /> 💳 Карта (скоро)
          </label>
          <div class="title-display" style="font-size: 0.95rem">🪙 {{ cartTotal }}</div>
          <button class="btn btn-primary btn-sm" :disabled="checkingOut" @click="checkout">
            {{ checkingOut ? 'Оформляем...' : 'Оформить заказ' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
