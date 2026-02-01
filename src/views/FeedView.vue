<script setup lang="ts">
import { computed, watchEffect } from "vue"
import { useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import { useAuthStore } from "@/stores/auth"
import { usePostsStore } from "@/stores/posts"
import type { Post, User } from "@/types"
import PostComposer from "@/components/PostComposer.vue"
import PostCard from "@/components/PostCard.vue"

const router = useRouter()
const authStore = useAuthStore()
const postsStore = usePostsStore()

authStore.initialize()
postsStore.initialize()

const { isAuthenticated, currentUser, users } = storeToRefs(authStore)
const { feed } = storeToRefs(postsStore)

watchEffect(() => {
  if (!isAuthenticated.value) {
    router.replace("/login")
  }
})

const feedItems = computed(() => {
  const directory = new Map<string, User>()
  users.value.forEach((user) => {
    directory.set(user.id, user)
  })

  return feed.value.map((post: Post) => {
    const author = directory.get(post.authorId)
    return {
      post,
      author:
        author ?? {
          id: post.authorId,
          name: "Unknown friend",
          email: "",
          password: "",
          bio: "",
          avatarColor: "#94a3b8",
          friends: [],
        },
    }
  })
})

const hasFriends = computed(() => (currentUser.value?.friends.length ?? 0) > 0)
</script>

<template>
  <section v-if="currentUser" class="feed">
    <div class="feed__main">
      <PostComposer class="feed__composer" />

      <div v-if="feedItems.length" class="feed__posts">
        <PostCard v-for="item in feedItems" :key="item.post.id" :post="item.post" :author="item.author" />
      </div>

      <div v-else class="feed__empty">
        <h2>Your feed is quiet</h2>
        <p>Start by sharing your first update or connecting with friends to see their posts.</p>
      </div>
    </div>

    <aside class="feed__sidebar" aria-label="Suggestions">
      <div class="card">
        <h3>Quick tips</h3>
        <ul>
          <li>Use the Friends tab to send connection requests.</li>
          <li>Message a friend directly from the Messages tab.</li>
          <li>Edit your profile to make the space your own.</li>
        </ul>
      </div>

      <div v-if="!hasFriends" class="card card--highlight">
        <h3>Connect with people</h3>
        <p>Head to the Friends tab to find suggested connections.</p>
      </div>
    </aside>
  </section>
</template>

<style scoped>
.feed {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 1.2fr);
  gap: 28px;
  width: min(1200px, 100%);
}

.feed__main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feed__composer {
  position: sticky;
  top: 32px;
  z-index: 10;
}

.feed__posts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feed__empty {
  background: white;
  border-radius: 18px;
  padding: 40px 32px;
  text-align: center;
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #475569;
}

.feed__empty h2 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1e293b;
}

.feed__sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  align-self: start;
  top: 32px;
}

.card {
  background: white;
  border-radius: 18px;
  padding: 20px 22px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 12px 32px -32px rgba(15, 23, 42, 0.8);
}

.card h3 {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #1e293b;
}

.card ul {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #64748b;
  padding-left: 18px;
}

.card--highlight {
  border: 1px solid rgba(99, 102, 241, 0.35);
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.08), rgba(148, 163, 184, 0.08));
}

@media (max-width: 1100px) {
  .feed {
    grid-template-columns: 1fr;
  }

  .feed__sidebar {
    position: relative;
    top: 0;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .card {
    flex: 1 1 240px;
  }
}
</style>
