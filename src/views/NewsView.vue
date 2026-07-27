<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import newsApi from '../api/news'
import SkeletonCard from '../components/SkeletonCard.vue'

const posts = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    posts.value = await newsApi.list()
  } finally {
    loading.value = false
  }
}

async function toggleLike(p) {
  const { liked } = await newsApi.toggleLike(p.id)
  p.likedByMe = liked
  p.likeCount += liked ? 1 : -1
}

function formatDate(d) {
  return new Date(d).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <h1 class="title-display" style="font-size: 1.4rem; margin-bottom: 0.3rem">📰 Новости <span class="accent">Клуба</span></h1>
    <p style="font-size: 0.82rem; color: var(--t2); margin-bottom: 1.5rem">Объявления от админов и мастеров клуба</p>

    <div v-if="loading" class="grid" style="gap: 1rem">
      <SkeletonCard v-for="n in 3" :key="n" :lines="2" />
    </div>
    <div v-else-if="posts.length === 0" class="empty-state">Пока нет новостей</div>

    <div v-else class="grid" style="gap: 1rem">
      <div v-for="p in posts" :key="p.id" class="card">
        <img
          v-if="p.imageUrl"
          :src="p.imageUrl"
          alt=""
          style="width: 100%; max-height: 260px; object-fit: cover; border-radius: var(--r); margin-bottom: 1rem"
        />
        <RouterLink :to="`/news/${p.id}`" class="title-display" style="font-size: 1.05rem; display: block; margin-bottom: 0.4rem; cursor: pointer">
          {{ p.title }}
        </RouterLink>
        <p style="font-size: 0.85rem; color: var(--t2); margin-bottom: 0.75rem; white-space: pre-wrap">{{ p.description }}</p>
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.6rem">
          <div style="font-size: 0.75rem; color: var(--t3)">{{ p.author.login }} · {{ formatDate(p.createdAt) }}</div>
          <div style="display: flex; gap: 0.5rem">
            <button class="btn btn-sm" :class="p.likedByMe ? 'btn-primary' : 'btn-outline'" @click="toggleLike(p)">
              ❤️ {{ p.likeCount }}
            </button>
            <RouterLink :to="`/news/${p.id}`" class="btn btn-outline btn-sm">💬 {{ p.commentCount }}</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
