<script setup>
import { computed, onMounted } from 'vue'
import { useTitlesStore } from '../stores/titles'

const props = defineProps({
  name: { type: String, required: true },
  titleId: { type: String, default: null },
})

const titles = useTitlesStore()
onMounted(() => titles.ensureLoaded())

const title = computed(() => (props.titleId ? titles.map[props.titleId] : null))
</script>

<template>
  <span>
    {{ name }}<span
      v-if="title"
      :style="{ color: title.color }"
      style="font-size: 0.78em; font-weight: 600; margin-left: 0.45em"
      >{{ title.name }}</span
    >
  </span>
</template>
