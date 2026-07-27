<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import newsApi from '../api/news'

const route = useRoute()
const auth = useAuthStore()
const post = ref(null)
const loading = ref(true)
const commentText = ref('')
const posting = ref(false)

async function load() {
  loading.value = true
  try {
    post.value = await newsApi.detail(route.params.id)
  } finally {
    loading.value = false
  }
}

async function toggleLike() {
  const { liked } = await newsApi.toggleLike(post.value.id)
  post.value.likedByMe = liked
  post.value.likeCount += liked ? 1 : -1
}

async function toggleCommentLike(c) {
  const { liked } = await newsApi.toggleCommentLike(c.id)
  c.likedByMe = liked
  c.likeCount += liked ? 1 : -1
}

async function submitComment() {
  if (!commentText.value.trim()) return
  posting.value = true
  try {
    const comment = await newsApi.addComment(post.value.id, commentText.value.trim())
    post.value.comments.push(comment)
    commentText.value = ''
  } finally {
    posting.value = false
  }
}

function isMine(c) {
  return !c.isStaff && c.authorName === auth.user?.name
}

async function removeComment(c) {
  if (!confirm('Удалить свой комментарий?')) return
  await newsApi.removeComment(c.id)
  post.value.comments = post.value.comments.filter((x) => x.id !== c.id)
}

function formatDate(d) {
  return new Date(d).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

watch(() => route.params.id, load)
onMounted(load)
</script>

<template>
  <div class="wrap">
    <RouterLink to="/news" style="font-size: 0.8rem; color: var(--t2); display: inline-block; margin-bottom: 1rem">← Новости</RouterLink>

    <div v-if="loading" style="color: var(--t2); text-align: center; padding: 2rem">Загрузка...</div>

    <template v-else-if="post">
      <div class="card" style="margin-bottom: 1.5rem">
        <img
          v-if="post.imageUrl"
          :src="post.imageUrl"
          alt=""
          style="width: 100%; max-height: 340px; object-fit: cover; border-radius: var(--r); margin-bottom: 1rem"
        />
        <h1 class="title-display" style="font-size: 1.25rem; margin-bottom: 0.5rem">{{ post.title }}</h1>
        <p style="font-size: 0.88rem; color: var(--t2); white-space: pre-wrap; margin-bottom: 0.75rem">{{ post.description }}</p>
        <div style="font-size: 0.75rem; color: var(--t3); margin-bottom: 0.75rem">{{ post.author.login }} · {{ formatDate(post.createdAt) }}</div>
        <button class="btn btn-sm" :class="post.likedByMe ? 'btn-primary' : 'btn-outline'" @click="toggleLike">
          ❤️ {{ post.likeCount }}
        </button>
      </div>

      <div class="title-display" style="font-size: 0.9rem; margin-bottom: 0.75rem">Комментарии ({{ post.comments.length }})</div>

      <div class="card" style="margin-bottom: 1.5rem">
        <textarea
          v-model="commentText"
          placeholder="Написать комментарий..."
          style="width: 100%; min-height: 70px; background: var(--bg3); border: 1px solid var(--b); border-radius: var(--r); padding: 0.6rem; color: var(--t); font-size: 0.85rem; margin-bottom: 0.6rem; resize: vertical"
        ></textarea>
        <button class="btn btn-primary btn-sm" :disabled="posting || !commentText.trim()" @click="submitComment">
          {{ posting ? 'Отправляем...' : 'Отправить' }}
        </button>
      </div>

      <div v-if="post.comments.length === 0" class="empty-state">Пока нет комментариев</div>
      <div v-else class="grid" style="gap: 0.75rem">
        <div
          v-for="c in post.comments"
          :key="c.id"
          class="card"
          :style="c.isStaff ? 'border-color: var(--pl); background: rgba(168,85,247,0.08)' : ''"
        >
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap">
            <div style="font-size: 0.85rem">
              <span style="color: var(--t)">{{ c.authorName }}</span>
              <span v-if="c.isStaff" class="status-pill status-pending" style="margin-left: 0.4rem">
                {{ c.authorRole === 'MASTER' ? '🧙 Мастер' : '🛡️ Админ' }}
              </span>
              <span style="color: var(--t3); font-size: 0.75rem; margin-left: 0.5rem">{{ formatDate(c.createdAt) }}</span>
            </div>
            <button v-if="isMine(c)" class="btn btn-outline btn-sm" @click="removeComment(c)">Удалить</button>
          </div>
          <p style="font-size: 0.87rem; color: var(--t2); margin: 0.5rem 0">{{ c.text }}</p>
          <button class="btn btn-sm" :class="c.likedByMe ? 'btn-primary' : 'btn-outline'" @click="toggleCommentLike(c)">
            ❤️ {{ c.likeCount }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
