<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const experience = ref('new')
const password = ref('')
const password2 = ref('')
const error = ref('')
const loading = ref(false)

const experienceOptions = [
  { value: 'new', label: '🐣 Новичок — первый раз слышу' },
  { value: 'mid', label: '⚔️ Играл несколько раз' },
  { value: 'exp', label: '🧙 Опытный игрок' },
  { value: 'dm', label: '👑 Сам веду игры' },
]

async function handleSubmit() {
  error.value = ''
  if (!name.value || !email.value || !password.value || !password2.value) {
    error.value = 'Заполни все поля'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Пароль минимум 6 символов'
    return
  }
  if (password.value !== password2.value) {
    error.value = 'Пароли не совпадают'
    return
  }
  loading.value = true
  try {
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
      experience: experience.value,
    })
    router.push({ name: 'dashboard' })
  } catch (e) {
    error.value = e.response?.data?.message || 'Не удалось зарегистрироваться'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-card">
    <h1 class="title-display" style="text-align: center; font-size: 1.3rem; margin-bottom: 1.5rem">
      Вступить в Афину
    </h1>
    <div v-if="error" class="alert alert-err">{{ error }}</div>
    <div class="field">
      <label>Имя героя (никнейм)</label>
      <input v-model="name" placeholder="DragonSlayer_KZ" />
    </div>
    <div class="field">
      <label>Email</label>
      <input v-model="email" type="email" placeholder="hero@dnd.kz" />
    </div>
    <div class="field">
      <label>Опыт в D&amp;D</label>
      <select v-model="experience">
        <option v-for="opt in experienceOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>
    <div class="field">
      <label>Пароль</label>
      <input v-model="password" type="password" placeholder="минимум 6 символов" />
    </div>
    <div class="field">
      <label>Подтверди пароль</label>
      <input v-model="password2" type="password" placeholder="••••••••" @keyup.enter="handleSubmit" />
    </div>
    <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="loading" @click="handleSubmit">
      {{ loading ? 'Регистрируем...' : 'Вступить в клуб 🎲' }}
    </button>
    <p style="text-align: center; margin-top: 1rem; font-size: 0.82rem; color: var(--t2)">
      Уже в клубе? <RouterLink to="/login" style="color: var(--pp)">Войти</RouterLink>
    </p>
  </div>
</template>
