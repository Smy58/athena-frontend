<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const login = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  if (!login.value || !password.value) {
    error.value = 'Заполни все поля'
    return
  }
  loading.value = true
  try {
    await auth.login({ login: login.value, password: password.value })
    router.push({ name: 'dashboard' })
  } catch (e) {
    error.value = e.response?.data?.message || 'Неверный логин или пароль'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-card">
    <h1 class="title-display" style="text-align: center; font-size: 1.3rem; margin-bottom: 1.5rem">
      Войти в клуб
    </h1>
    <div v-if="error" class="alert alert-err">{{ error }}</div>
    <div class="field">
      <label>Никнейм или Email</label>
      <input v-model="login" placeholder="герой_алматы" />
    </div>
    <div class="field">
      <label>Пароль</label>
      <input v-model="password" type="password" placeholder="••••••••" @keyup.enter="handleSubmit" />
    </div>
    <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="loading" @click="handleSubmit">
      {{ loading ? 'Входим...' : 'Войти' }}
    </button>
    <p style="text-align: center; margin-top: 1rem; font-size: 0.82rem; color: var(--t2)">
      Нет аккаунта? <RouterLink to="/register" style="color: var(--pp)">Вступить в клуб</RouterLink>
    </p>
  </div>
</template>
