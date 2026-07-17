<script setup>
import { ref, onMounted } from 'vue'
import faqApi from '../api/faq'
import SkeletonCard from '../components/SkeletonCard.vue'

const FAQ_DATA = ref([])
const loading = ref(true)
const expanded = ref(null)

function toggle(i) {
  expanded.value = expanded.value === i ? null : i
}

onMounted(async () => {
  try {
    FAQ_DATA.value = await faqApi.list()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="wrap" style="max-width: 720px">
    <h1 class="title-display" style="font-size: 1.4rem; margin-bottom: 0.3rem">Часто задаваемые <span class="accent">вопросы</span></h1>
    <p style="font-size: 0.82rem; color: var(--t2); margin-bottom: 1.5rem">Всё, что нужно знать о клубе и сайте</p>

    <div v-if="loading" style="display: flex; flex-direction: column; gap: 0.6rem">
      <SkeletonCard v-for="n in 6" :key="n" :lines="0" />
    </div>
    <div v-else style="display: flex; flex-direction: column; gap: 0.6rem">
      <div v-for="(f, i) in FAQ_DATA" :key="f.id" class="card" style="cursor: pointer" @click="toggle(i)">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-size: 0.88rem; color: var(--t)">{{ f.question }}</span>
          <span style="font-size: 0.75rem; color: var(--t3)">{{ expanded === i ? '▲' : '▼' }}</span>
        </div>
        <div v-if="expanded === i" style="font-size: 0.82rem; color: var(--t2); margin-top: 0.75rem; line-height: 1.6">{{ f.answer }}</div>
      </div>
    </div>
  </div>
</template>
