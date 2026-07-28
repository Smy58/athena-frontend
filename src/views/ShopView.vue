<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import shopApi from '../api/shop'
import SkeletonCard from '../components/SkeletonCard.vue'

const auth = useAuthStore()
const titleSections = ref([])
const reactions = ref([])
const tab = ref(null)
const loading = ref(true)
const error = ref('')

const tabs = computed(() => [
  ...titleSections.value.map((s) => ({ id: s.id, name: s.name, icon: s.icon })),
  ...(reactions.value.length ? [{ id: '__reactions__', name: 'Реакции', icon: '🎭' }] : []),
])
const activeSection = computed(() => titleSections.value.find((s) => s.id === tab.value))

async function load() {
  loading.value = true
  try {
    const cat = await shopApi.catalog()
    titleSections.value = cat.titleSections
    reactions.value = cat.reactions
    if (!tab.value && tabs.value.length) tab.value = tabs.value[0].id
  } finally {
    loading.value = false
  }
}

function owned(titleId) {
  return auth.user?.titles?.includes(titleId)
}

function ownedReaction(reactionId) {
  return auth.user?.reactions?.includes(reactionId)
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

async function buyReaction(reaction) {
  error.value = ''
  try {
    await shopApi.buyReaction(reaction.id)
    await auth.refreshProfile()
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось купить реакцию'
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
      <div v-if="tabs.length > 1" style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap">
        <button
          v-for="s in tabs"
          :key="s.id"
          class="btn btn-sm"
          :class="tab === s.id ? 'btn-primary' : 'btn-outline'"
          @click="tab = s.id"
        >
          {{ s.icon }} {{ s.name }}
        </button>
      </div>

      <div v-if="tab === '__reactions__'" class="grid grid-cards">
        <div v-for="r in reactions" :key="r.id" class="card" style="text-align: center">
          <div class="reaction-icon" style="width: 3.2rem; height: 3.2rem; margin: 0 auto 0.6rem" v-html="r.svg"></div>
          <div class="title-display" style="font-size: 0.9rem; margin-bottom: 0.4rem">{{ r.name }}</div>
          <div style="font-size: 0.78rem; color: var(--t2); margin-bottom: 0.8rem">🪙 {{ r.price }}</div>
          <button v-if="!ownedReaction(r.id)" class="btn btn-primary btn-sm" @click="buyReaction(r)">Купить</button>
          <button v-else class="btn btn-outline btn-sm" disabled>✓ Куплено</button>
        </div>
      </div>

      <div v-else-if="activeSection" class="grid grid-cards">
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
