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

const ownedSections = computed(() =>
  titleSections.value
    .map((s) => ({ ...s, titles: s.titles.filter((t) => auth.user?.titles?.includes(t.id)) }))
    .filter((s) => s.titles.length > 0),
)
const activeSection = computed(() => ownedSections.value.find((s) => s.id === tab.value))

async function load() {
  loading.value = true
  try {
    const cat = await shopApi.catalog()
    titleSections.value = cat.titleSections
    if (!tab.value && ownedSections.value.length) tab.value = ownedSections.value[0].id
  } finally {
    loading.value = false
  }
}

async function selectTitle(titleId) {
  await shopApi.selectTitle(titleId)
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

    <div v-else-if="ownedSections.length === 0" class="empty-state">Пока пусто — загляни в Магазин</div>

    <template v-else>
      <div v-if="ownedSections.length > 1" style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap">
        <button
          v-for="s in ownedSections"
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
          <button v-if="auth.user?.activeTitle === t.id" class="btn btn-outline btn-sm" disabled>✓ Выбрано</button>
          <button v-else class="btn btn-primary btn-sm" @click="selectTitle(t.id)">Выбрать</button>
        </div>
      </div>
    </template>
  </div>
</template>
