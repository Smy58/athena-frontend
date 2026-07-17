<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="hero">
    <div class="owl-hero">🦉</div>
    <p class="hero-eyebrow">D&amp;D Клуб Афина</p>
    <h1 class="hero-title title-display">
      Твоё <em class="accent">Приключение</em><br />начинается здесь
    </h1>
    <p class="hero-sub">
      Регулярные кампейны, ваншоты и ивенты. Собери отряд, выбери гильдию, найди мастера по душе.
    </p>
    <div class="hero-cta">
      <RouterLink to="/register" class="btn btn-primary btn-lg">🎲 Вступить в клуб</RouterLink>
      <RouterLink to="/about" class="btn btn-outline btn-lg">Узнать больше</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.hero {
  padding: 4rem 1.5rem;
  text-align: center;
}
.owl-hero {
  width: 90px;
  height: 90px;
  margin: 0 auto 1.75rem;
  background: linear-gradient(135deg, var(--p), #3a0a6e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  box-shadow: 0 0 40px rgba(123, 47, 190, 0.5);
}
.hero-eyebrow {
  font-family: var(--font-display);
  font-size: 0.68rem;
  letter-spacing: 0.28em;
  color: var(--pp);
  text-transform: uppercase;
  margin-bottom: 1rem;
}
.hero-title {
  font-size: clamp(1.9rem, 5vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.9rem;
}
.hero-sub {
  font-size: 0.95rem;
  color: var(--t2);
  max-width: 440px;
  margin: 0 auto 2rem;
  line-height: 1.75;
}
.hero-cta {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
