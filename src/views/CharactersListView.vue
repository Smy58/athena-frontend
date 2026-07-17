<script setup>
import { ref, onMounted } from 'vue'
import charactersApi from '../api/characters'
import SkeletonCard from '../components/SkeletonCard.vue'

const characters = ref([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  try {
    characters.value = await charactersApi.list()
  } catch (e) {
    error.value = 'Не удалось загрузить персонажей'
  } finally {
    loading.value = false
  }
}

async function remove(id) {
  if (!confirm('Точно удалить этого персонажа?')) return
  await charactersApi.remove(id)
  characters.value = characters.value.filter((c) => c.id !== id)
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem">
      <h1 class="title-display" style="font-size: 1.4rem">
        Твои <span class="accent">Персонажи</span>
      </h1>
      <RouterLink to="/characters/new" class="btn btn-primary">✦ Создать персонажа</RouterLink>
    </div>

    <div v-if="loading" class="grid grid-cards">
      <SkeletonCard v-for="n in 3" :key="n" avatar center :lines="2" />
    </div>
    <div v-else-if="error" class="alert alert-err">{{ error }}</div>

    <div v-else-if="characters.length === 0" class="empty-state">
      <div style="font-size: 2.5rem; margin-bottom: 1rem">🎭</div>
      <p style="margin-bottom: 1.5rem">У тебя пока нет персонажей.</p>
      <RouterLink to="/characters/new" class="btn btn-primary">✦ Создать первого героя</RouterLink>
    </div>

    <div v-else class="grid grid-cards">
      <div v-for="c in characters" :key="c.id" class="card" style="text-align: center">
        <RouterLink :to="`/characters/${c.id}`" style="display: block">
          <div style="width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 0.75rem; background: linear-gradient(135deg, rgba(123,47,190,.35), rgba(168,85,247,.15)); display: flex; align-items: center; justify-content: center; font-size: 1.7rem">🧙</div>
          <div class="title-display" style="font-size: 0.95rem; margin-bottom: 0.3rem">{{ c.name }}</div>
          <div style="font-size: 0.78rem; color: var(--t2)">{{ c.species }} · {{ c.className }}</div>
          <div style="font-size: 0.7rem; color: var(--t3); margin-top: 0.4rem">❤️ {{ c.curHp }} / {{ c.maxHp }} · Уровень {{ c.level }}</div>
        </RouterLink>
        <button class="btn btn-danger btn-sm" style="margin-top: 0.9rem" @click="remove(c.id)">🗑 Удалить</button>
      </div>
    </div>
  </div>
</template>
