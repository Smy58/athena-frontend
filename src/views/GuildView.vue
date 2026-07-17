<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import usersApi from '../api/users'
import guildApi from '../api/guild'
import { guildRankInfo } from '../utils/guild'
import SkeletonCard from '../components/SkeletonCard.vue'

const auth = useAuthStore()
const GUILDS = ref({})
const GUILD_RANKS = ref([])
const jar = ref(null)
const members = ref([])
const loading = ref(false)
const switching = ref(false)
const selectedRank = ref('r1')
const loggingContract = ref(false)

const myGuild = computed(() => (auth.user?.guild ? GUILDS.value[auth.user.guild] : null))
const myRank = computed(() => guildRankInfo(auth.user?.completedContracts ?? 0))

async function loadGuildInfo() {
  const [infoList, rankList] = await Promise.all([guildApi.info(), guildApi.ranks()])
  GUILDS.value = Object.fromEntries(infoList.map((g) => [g.guild, g]))
  GUILD_RANKS.value = rankList
}

async function loadGuildData() {
  if (!auth.user?.guild) return
  loading.value = true
  try {
    const [jarData, memberList] = await Promise.all([
      guildApi.jar(auth.user.guild),
      guildApi.members(auth.user.guild),
    ])
    jar.value = jarData
    members.value = memberList
  } finally {
    loading.value = false
  }
}

async function pickGuild(key) {
  switching.value = true
  try {
    await usersApi.setGuild(key)
    await auth.refreshProfile()
    await loadGuildData()
  } finally {
    switching.value = false
  }
}

async function logContract() {
  loggingContract.value = true
  try {
    await guildApi.logContract(auth.user.guild, selectedRank.value)
    await auth.refreshProfile()
    await loadGuildData()
  } finally {
    loggingContract.value = false
  }
}

onMounted(async () => {
  await loadGuildInfo()
  await loadGuildData()
})
</script>

<template>
  <div class="wrap">
    <h1 class="title-display" style="font-size: 1.4rem; margin-bottom: 0.3rem">Гильдии <span class="accent">Афины</span></h1>
    <p style="font-size: 0.82rem; color: var(--t2); margin-bottom: 1.5rem">Сезон «Контракты Афины»</p>

    <div v-if="!myGuild">
      <div class="grid grid-cards">
        <div v-for="g in Object.values(GUILDS)" :key="g.guild" class="card">
          <div style="font-size: 1.8rem; margin-bottom: 0.5rem">{{ g.icon }}</div>
          <div class="title-display" style="font-size: 1rem; margin-bottom: 0.4rem" :style="{ color: g.color }">{{ g.name }}</div>
          <div style="font-size: 0.78rem; color: var(--t2); margin-bottom: 0.9rem">{{ g.role }}</div>
          <button class="btn btn-primary btn-sm" :disabled="switching" @click="pickGuild(g.guild)">Выбрать эту гильдию</button>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="card" style="margin-bottom: 1.25rem">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem">
          <div style="font-size: 2rem">{{ myGuild.icon }}</div>
          <div>
            <div class="title-display" style="font-size: 1.15rem" :style="{ color: myGuild.color }">{{ myGuild.name }}</div>
            <div style="font-size: 0.78rem; color: var(--t2)">{{ myRank.name }} · {{ auth.user.completedContracts }} контрактов</div>
          </div>
        </div>
        <div style="font-size: 0.82rem; color: var(--t2); margin-bottom: 0.6rem">{{ myGuild.role }}</div>
        <div style="font-size: 0.8rem; color: var(--t); margin-bottom: 0.5rem"><strong>Бонус:</strong> {{ myGuild.bonus }}</div>
        <div style="font-size: 0.8rem; color: var(--t)" v-if="myRank.n >= 3"><strong>Ранг 3:</strong> {{ myGuild.rank3 }}</div>
        <button class="btn btn-outline btn-sm" style="margin-top: 1rem" :disabled="switching" @click="pickGuild(null)">Сменить гильдию</button>
      </div>

      <div class="grid" style="grid-template-columns: 1fr 1fr; margin-bottom: 1.25rem">
        <div class="card">
          <div style="font-size: 0.72rem; color: var(--t3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.5rem">Твои очки</div>
          <div style="font-size: 0.85rem; color: var(--t2)">💎 {{ auth.user.fameStones }} камешков славы</div>
          <div style="font-size: 0.85rem; color: var(--t2)">🪙 {{ auth.user.finiki }} фиников</div>
        </div>
        <div class="card" v-if="jar">
          <div style="font-size: 0.72rem; color: var(--t3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.5rem">Банка гильдии</div>
          <div style="font-size: 0.85rem; color: var(--t2); margin-bottom: 0.5rem">{{ jar.total }} / {{ jar.capacity }} камешков</div>
          <div style="height: 8px; background: var(--bg3); border-radius: 4px; overflow: hidden">
            <div style="height: 100%; background: linear-gradient(90deg, var(--p), var(--pl))" :style="{ width: jar.percent + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom: 1.25rem">
        <div class="title-display" style="font-size: 0.85rem; margin-bottom: 0.75rem">Отметить контракт</div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center">
          <select v-model="selectedRank" style="background: var(--bg3); border: 1px solid var(--b); border-radius: var(--r); padding: 0.55rem; color: var(--t); flex: 1; min-width: 200px">
            <option v-for="r in GUILD_RANKS" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
          <button class="btn btn-primary btn-sm" :disabled="loggingContract" @click="logContract">Записать результат</button>
        </div>
      </div>

      <div class="title-display" style="font-size: 0.85rem; margin-bottom: 0.75rem">Лидеры гильдии</div>
      <div v-if="loading" class="grid grid-cards">
        <SkeletonCard v-for="n in 4" :key="n" center :lines="1" />
      </div>
      <div v-else-if="members.length === 0" class="empty-state">Пока никого — стань первым!</div>
      <div v-else class="grid grid-cards">
        <div v-for="(m, i) in members" :key="m.id" class="card" style="text-align: center">
          <div style="font-size: 1.2rem; margin-bottom: 0.3rem">{{ i === 0 ? '👑' : '⚔️' }}</div>
          <div class="title-display" style="font-size: 0.9rem">{{ m.name }}</div>
          <div style="font-size: 0.75rem; color: var(--t2)">💎 {{ m.fameStones }} · {{ m.completedContracts }} контрактов</div>
        </div>
      </div>
    </div>
  </div>
</template>
