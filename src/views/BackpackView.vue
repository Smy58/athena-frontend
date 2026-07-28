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

const ownedSections = computed(() =>
  titleSections.value
    .map((s) => ({ ...s, titles: s.titles.filter((t) => auth.user?.titles?.includes(t.id)) }))
    .filter((s) => s.titles.length > 0),
)
const ownedReactions = computed(() => reactions.value.filter((r) => auth.user?.reactions?.includes(r.id)))
const tabs = computed(() => [
  ...ownedSections.value.map((s) => ({ id: s.id, name: s.name, icon: s.icon })),
  ...(ownedReactions.value.length ? [{ id: '__reactions__', name: 'Реакции', icon: '🎭' }] : []),
])
const activeSection = computed(() => ownedSections.value.find((s) => s.id === tab.value))

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

async function selectTitle(titleId) {
  await shopApi.selectTitle(titleId)
  await auth.refreshProfile()
}

async function selectReaction(reactionId) {
  await shopApi.selectReaction(reactionId)
  await auth.refreshProfile()
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem">
      <div>
        <h1 class="title-display" style="font-size: 1.4rem">🎒 Рюкзак</h1>
        <p style="font-size: 0.82rem; color: var(--t2); margin-top: 0.3rem">То, что ты уже купил</p>
      </div>
      <RouterLink to="/shop" class="btn btn-outline btn-sm">🛍️ Магазин</RouterLink>
    </div>

    <div v-if="loading" class="grid grid-cards">
      <SkeletonCard v-for="n in 4" :key="n" center :lines="1" button />
    </div>

    <div v-else-if="tabs.length === 0" class="empty-state">Пока пусто — загляни в Магазин</div>

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
        <div v-for="r in ownedReactions" :key="r.id" class="card" style="text-align: center">
          <div class="reaction-icon" style="width: 3.2rem; height: 3.2rem; margin: 0 auto 0.6rem" v-html="r.svg"></div>
          <div class="title-display" style="font-size: 0.9rem; margin-bottom: 0.4rem">{{ r.name }}</div>
          <button v-if="auth.user?.activeReaction === r.id" class="btn btn-outline btn-sm" disabled>✓ Выбрано</button>
          <button v-else class="btn btn-primary btn-sm" @click="selectReaction(r.id)">Выбрать</button>
        </div>
      </div>

      <div v-else-if="activeSection" class="grid grid-cards">
        <div v-for="t in activeSection.titles" :key="t.id" class="card" style="text-align: center">
          <div class="title-display" style="font-size: 0.9rem; margin-bottom: 0.4rem">{{ t.name }}</div>
          <button v-if="auth.user?.activeTitle === t.id" class="btn btn-outline btn-sm" disabled>✓ Выбрано</button>
          <button v-else class="btn btn-primary btn-sm" @click="selectTitle(t.id)">Выбрать</button>
        </div>
      </div>
    </template>
  </div>
</template>
