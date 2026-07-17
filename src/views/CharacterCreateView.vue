<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import charactersApi from '../api/characters'

const router = useRouter()
const error = ref('')
const loading = ref(false)

const form = ref({
  name: '',
  species: '',
  className: '',
  background: '',
  level: 1,
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
  maxHp: 10,
  ac: 10,
  bio: '',
})

async function handleSubmit() {
  error.value = ''
  if (!form.value.name || !form.value.species || !form.value.className || !form.value.background) {
    error.value = 'Заполни имя, вид, класс и предысторию'
    return
  }
  loading.value = true
  try {
    const created = await charactersApi.create(form.value)
    router.push(`/characters/${created.id}`)
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось создать персонажа'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="wrap" style="max-width: 520px">
    <RouterLink to="/characters" class="btn btn-ghost" style="margin-bottom: 1rem">← Назад к списку</RouterLink>
    <div class="auth-card" style="margin: 0">
      <h1 class="title-display" style="text-align: center; font-size: 1.3rem; margin-bottom: 1.5rem">Новый персонаж</h1>
      <div v-if="error" class="alert alert-err">{{ error }}</div>

      <div class="field"><label>Имя персонажа</label><input v-model="form.name" placeholder="Торин Дубощит" /></div>
      <div class="field"><label>Вид</label><input v-model="form.species" placeholder="Человек, Эльф, Дворф..." /></div>
      <div class="field"><label>Класс</label><input v-model="form.className" placeholder="Воин, Волшебник, Плут..." /></div>
      <div class="field"><label>Предыстория</label><input v-model="form.background" placeholder="Солдат, Мудрец, Преступник..." /></div>
      <div class="field"><label>Уровень</label><input v-model.number="form.level" type="number" min="1" max="20" /></div>

      <div class="field" style="margin-bottom: 0.6rem"><label>Характеристики</label></div>
      <div class="grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 1.1rem">
        <div class="field" style="margin-bottom: 0" v-for="stat in ['str', 'dex', 'con', 'int', 'wis', 'cha']" :key="stat">
          <label style="text-align: center">{{ stat }}</label>
          <input v-model.number="form[stat]" type="number" style="text-align: center" />
        </div>
      </div>

      <div class="grid" style="grid-template-columns: 1fr 1fr; margin-bottom: 0.5rem">
        <div class="field"><label>Макс. ХП</label><input v-model.number="form.maxHp" type="number" min="1" /></div>
        <div class="field"><label>КД</label><input v-model.number="form.ac" type="number" min="1" /></div>
      </div>

      <div class="field"><label>История персонажа</label><textarea v-model="form.bio" placeholder="Кратко опиши историю персонажа..."></textarea></div>

      <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="loading" @click="handleSubmit">
        {{ loading ? 'Создаём...' : 'Создать персонажа ✦' }}
      </button>
    </div>
  </div>
</template>
