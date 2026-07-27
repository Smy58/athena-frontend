<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import shopApi from '../api/shop'
import SkeletonCard from '../components/SkeletonCard.vue'

const auth = useAuthStore()
const titleSections = ref([])
const tab = ref(null)
const loading = ref(true)
const error = ref('')

const activeSection = computed(() => titleSections.value.find((s) => s.id === tab.value))

async function load() {
  loading.value = true
  try {
    const cat = await shopApi.catalog()
    titleSections.value = cat.titleSections
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

onMounted(load)
</script>

<template>
  <div class="wrap">
    <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem">
      <div>
        <h1 class="title-display" style="font-size: 1.4rem">🛍️ Магазин</h1>
        <p style="font-size: 0.82rem; color: var(--t2); margin-top: 0.3rem">Звания и другие покупки навсегда</p>
      </div>
      <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap">
        <div class="card" style="padding: 0.6rem 1rem; font-size: 0.9rem">🪙 {{ auth.user?.finiki ?? 0 }} фиников</div>
        <RouterLink to="/backpack" class="btn btn-outline btn-sm">🎒 Рюкзак</RouterLink>
        <RouterLink to="/shop/history" class="btn btn-outline btn-sm">📜 История покупок</RouterLink>
      </div>
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
          <button v-else class="btn btn-outline btn-sm" disabled>✓ Куплено</button>
        </div>
      </div>
    </template>
  </div>
</template>
