<template>
  <section class="not-found">
    <h1>Page not found</h1>
    <p>The page you are looking for doesn't exist or may have been moved.</p>
    <RouterLink to="/feed">Return to your feed</RouterLink>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router"
</script>

<style scoped>
.not-found {
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 48px 36px;
  text-align: center;
  width: min(480px, 100%);
  margin: 40px auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.not-found h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
}

.not-found p {
  color: #64748b;
}

.not-found a {
  align-self: center;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: white;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 12px;
  text-decoration: none;
}

.not-found a:hover {
  box-shadow: 0 14px 32px -28px rgba(99, 102, 241, 0.8);
}
</style>
