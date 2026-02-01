<script setup lang="ts">
import { ref } from "vue"
import { usePostsStore } from "@/stores/posts"

const emit = defineEmits<{
  (e: "posted"): void
}>()

const postsStore = usePostsStore()
postsStore.initialize()

const content = ref("")
const error = ref<string | null>(null)
const isSubmitting = ref(false)

const handleSubmit = async () => {
  const trimmed = content.value.trim()
  if (!trimmed) {
    error.value = "Share something with your friends before posting."
    return
  }

  try {
    isSubmitting.value = true
    error.value = null
    postsStore.createPost(trimmed)
    content.value = ""
    emit("posted")
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = "Something went wrong. Please try again."
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="composer" aria-label="Create a post">
    <form class="composer__form" @submit.prevent="handleSubmit">
      <textarea
        v-model="content"
        class="composer__input"
        placeholder="Share an update..."
        rows="3"
      />
      <div class="composer__actions">
        <span v-if="error" class="composer__error">{{ error }}</span>
        <button type="submit" class="composer__button" :disabled="isSubmitting">
          {{ isSubmitting ? "Posting..." : "Post update" }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.composer {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.08),
    0 10px 30px -24px rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.composer__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.composer__input {
  min-height: 120px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  border-radius: 12px;
  padding: 12px;
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.composer__input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.composer__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.composer__error {
  color: #ef4444;
  font-size: 0.875rem;
}

.composer__button {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 10px 18px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.composer__button:disabled {
  opacity: 0.6;
  cursor: default;
}

.composer__button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px -12px rgba(99, 102, 241, 0.75);
}
</style>
