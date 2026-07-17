<script setup>
defineProps({
  avatar: { type: Boolean, default: false },
  icon: { type: Boolean, default: false },
  lines: { type: Number, default: 2 },
  center: { type: Boolean, default: false },
  button: { type: Boolean, default: false },
})
</script>

<template>
  <div class="card skeleton-card" :class="{ center }">
    <div v-if="avatar" class="skeleton skeleton-avatar"></div>
    <div v-if="icon" class="skeleton skeleton-icon"></div>
    <div class="skeleton skeleton-title"></div>
    <div
      v-for="n in lines"
      :key="n"
      class="skeleton skeleton-line"
      :style="{ width: n === lines ? '55%' : '90%' }"
    ></div>
    <div v-if="button" class="skeleton skeleton-pill"></div>
  </div>
</template>
