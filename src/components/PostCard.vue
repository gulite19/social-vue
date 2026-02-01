<script setup lang="ts">
import { computed } from "vue"
import { formatDistanceToNow } from "date-fns"
import { storeToRefs } from "pinia"
import type { Post, User } from "@/types"
import { useAuthStore } from "@/stores/auth"
import { usePostsStore } from "@/stores/posts"
import UserAvatar from "./UserAvatar.vue"

const props = defineProps<{
  post: Post
  author: User
}>()

const postsStore = usePostsStore()
const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)

postsStore.initialize()
authStore.initialize()

const likeCount = computed(() => props.post.likeUserIds.length)
const likedByCurrentUser = computed(() => {
  const user = currentUser.value
  if (!user) {
    return false
  }
  return props.post.likeUserIds.includes(user.id)
})

const timestamp = computed(() => formatDistanceToNow(new Date(props.post.createdAt), { addSuffix: true }))

const handleLike = () => {
  postsStore.toggleLike(props.post.id)
}
</script>

<template>
  <article class="post">
    <header class="post__header">
      <UserAvatar :name="author.name" :color="author.avatarColor" :size="48" />
      <div>
        <h3 class="post__author">{{ author.name }}</h3>
        <time class="post__time" :datetime="post.createdAt">{{ timestamp }}</time>
      </div>
    </header>
    <p class="post__body">
      {{ post.content }}
    </p>
    <footer class="post__footer">
      <button class="post__action" type="button" @click="handleLike">
        <span aria-hidden="true">{{ likedByCurrentUser ? "💙" : "🤍" }}</span>
        <span>{{ likedByCurrentUser ? "Liked" : "Like" }}</span>
        <span v-if="likeCount" class="post__action-count">�?{{ likeCount }}</span>
      </button>
    </footer>
  </article>
</template>

<style scoped>
.post {
  background: white;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.08),
    0 12px 32px -26px rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.post__header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.post__author {
  font-size: 1.05rem;
  font-weight: 600;
  color: #111827;
}

.post__time {
  font-size: 0.85rem;
  color: #6b7280;
}

.post__body {
  font-size: 1rem;
  color: #1f2937;
  white-space: pre-wrap;
}

.post__footer {
  display: flex;
  justify-content: flex-start;
}

.post__action {
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #6366f1;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 999px;
  transition: background-color 0.15s ease;
}

.post__action:hover {
  background-color: rgba(99, 102, 241, 0.1);
}

.post__action-count {
  color: #64748b;
  font-weight: 500;
}
</style>
