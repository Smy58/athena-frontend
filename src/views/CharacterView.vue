<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import charactersApi from '../api/characters'

const route = useRoute()
const router = useRouter()

const character = ref(null)
const loading = ref(true)
const hpDelta = ref(null)

const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const abilityLabels = { str: 'СИЛ', dex: 'ЛОВ', con: 'ТЕЛ', int: 'ИНТ', wis: 'МДР', cha: 'ХАР' }

function modOf(score) {
  const m = Math.floor((score - 10) / 2)
  return m >= 0 ? `+${m}` : `${m}`
}

const hpColor = computed(() => {
  if (!character.value) return 'var(--t)'
  const pct = character.value.curHp / character.value.maxHp
  if (pct > 0.5) return '#5dcaa5'
  if (pct > 0.25) return '#fac775'
  return '#f09595'
})

async function load() {
  loading.value = true
  character.value = await charactersApi.get(route.params.id)
  loading.value = false
}

async function applyDamage() {
  const amt = Number(hpDelta.value) || 0
  if (amt <= 0) return
  const newHp = Math.max(0, character.value.curHp - amt)
  character.value = await charactersApi.update(character.value.id, { curHp: newHp })
  hpDelta.value = null
}

async function applyHeal() {
  const amt = Number(hpDelta.value) || 0
  if (amt <= 0) return
  const newHp = Math.min(character.value.maxHp, character.value.curHp + amt)
  character.value = await charactersApi.update(character.value.id, { curHp: newHp })
  hpDelta.value = null
}

async function remove() {
  if (!confirm('Точно удалить этого персонажа?')) return
  await charactersApi.remove(character.value.id)
  router.push('/characters')
}

onMounted(load)
</script>

<template>
  <div class="wrap" style="max-width: 520px">
    <RouterLink to="/characters" class="btn btn-ghost" style="margin-bottom: 1rem">← Назад к списку</RouterLink>

    <div v-if="loading">
      <div style="text-align: center; background: var(--bg2); border: 1px solid var(--b2); border-radius: var(--rxl); padding: 2rem 1.5rem; margin-bottom: 1.5rem">
        <div class="skeleton skeleton-avatar" style="width: 80px; height: 80px"></div>
        <div class="skeleton skeleton-title" style="width: 40%; margin: 0 auto 0.5rem"></div>
        <div class="skeleton skeleton-line" style="width: 55%; margin: 0 auto"></div>
      </div>

      <div class="card" style="margin-bottom: 1.25rem">
        <div class="skeleton skeleton-title" style="width: 35%; height: 1.7rem; margin-bottom: 1rem"></div>
        <div class="skeleton" style="height: 2.2rem; border-radius: var(--r)"></div>
      </div>

      <div class="grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 1.25rem">
        <div v-for="n in 6" :key="n" class="card" style="text-align: center; padding: 1rem 0.5rem">
          <div class="skeleton skeleton-line" style="width: 60%; margin: 0 auto 0.5rem"></div>
          <div class="skeleton skeleton-title" style="width: 40%; margin: 0 auto"></div>
        </div>
      </div>

      <div class="card">
        <div class="skeleton skeleton-title" style="width: 45%"></div>
        <div class="skeleton skeleton-line" style="width: 100%"></div>
        <div class="skeleton skeleton-line" style="width: 80%"></div>
      </div>
    </div>

    <template v-else-if="character">
      <div style="text-align: center; background: linear-gradient(135deg, rgba(123,47,190,.18), rgba(168,85,247,.05)); border: 1px solid var(--b2); border-radius: var(--rxl); padding: 2rem 1.5rem; margin-bottom: 1.5rem">
        <div style="width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 1rem; background: linear-gradient(135deg, var(--p), #3a0a6e); display: flex; align-items: center; justify-content: center; font-size: 2.2rem">🧙</div>
        <div class="title-display" style="font-size: 1.5rem; margin-bottom: 0.4rem">{{ character.name }}</div>
        <div style="color: var(--pp); font-size: 0.88rem">{{ character.species }} · {{ character.className }} · Уровень {{ character.level }}</div>
      </div>

      <div class="card" style="margin-bottom: 1.25rem">
        <div style="font-family: var(--font-display); font-size: 1.7rem; font-weight: 700; margin-bottom: 1rem" :style="{ color: hpColor }">
          {{ character.curHp }} / {{ character.maxHp }}
        </div>
        <div style="display: flex; gap: 0.5rem">
          <input v-model="hpDelta" type="number" placeholder="Число" style="flex: 1; background: var(--bg2); border: 1px solid var(--b); border-radius: var(--r); padding: 0.55rem; color: var(--t)" />
          <button class="btn btn-danger btn-sm" @click="applyDamage">➖ Урон</button>
          <button class="btn btn-primary btn-sm" @click="applyHeal">➕ Лечение</button>
        </div>
      </div>

      <div class="grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 1.25rem">
        <div v-for="a in abilities" :key="a" class="card" style="text-align: center; padding: 1rem 0.5rem">
          <div style="font-size: 0.65rem; color: var(--t3); letter-spacing: 0.1em; margin-bottom: 0.5rem">{{ abilityLabels[a] }}</div>
          <div class="title-display" style="font-size: 1.3rem; font-weight: 700">{{ character[a] }}</div>
          <div style="font-size: 0.75rem; color: var(--pp)">{{ modOf(character[a]) }}</div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 1.25rem">
        <div style="font-family: var(--font-display); font-size: 0.72rem; color: var(--t2); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.75rem">
          История персонажа
        </div>
        <div style="font-size: 0.85rem; color: var(--t2); line-height: 1.7">{{ character.bio || '—' }}</div>
      </div>

      <button class="btn btn-danger btn-sm" @click="remove">🗑 Удалить персонажа</button>
    </template>
  </div>
</template>
