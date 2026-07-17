<script setup>
import { onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()

onMounted(() => {
  if (auth.isLoggedIn) auth.refreshProfile()
})
</script>

<template>
  <NavBar />
  <router-view />
</template>
