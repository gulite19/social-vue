<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  name: string
  color: string
  size?: number
}>()

const initials = computed(() => {
  const trimmed = props.name.trim()
  if (!trimmed) {
    return "?"
  }

  const parts = trimmed.split(/\s+/)
  const firstInitial = parts[0]?.charAt(0)?.toUpperCase() ?? ""
  const secondInitial = parts.length > 1 ? parts[1]?.charAt(0)?.toUpperCase() ?? "" : ""
  const combined = `${firstInitial}${secondInitial}`.trim()
  return combined || firstInitial || "?"
})
</script>

<template>
  <div
    class="avatar"
    :style="{
      '--size': `${props.size ?? 48}px`,
      '--color': props.color || '#6366f1',
    }"
  >
    {{ initials }}
  </div>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);
  border-radius: 9999px;
  background: var(--color);
  color: white;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  flex-shrink: 0;
}
</style>
