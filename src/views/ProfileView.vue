<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from "vue"
import { useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import { useAuthStore } from "@/stores/auth"
import { usePostsStore } from "@/stores/posts"
import UserAvatar from "@/components/UserAvatar.vue"

const router = useRouter()
const authStore = useAuthStore()
const postsStore = usePostsStore()

authStore.initialize()
postsStore.initialize()

const { currentUser, users } = storeToRefs(authStore)

watchEffect(() => {
  if (!currentUser.value) {
    router.replace("/login")
  }
})

const postsByCurrentUser = computed(() => {
  const user = currentUser.value
  if (!user) {
    return []
  }
  return postsStore.postsByUser(user.id).value
})

const form = reactive({
  name: currentUser.value?.name ?? "",
  bio: currentUser.value?.bio ?? "",
})

const isSaving = ref(false)
const status = ref<string | null>(null)

const handleSave = async () => {
  if (!currentUser.value) {
    return
  }

  if (!form.name.trim()) {
    status.value = "Name cannot be empty."
    return
  }

  try {
    isSaving.value = true
    status.value = null
    await Promise.resolve(
      authStore.updateProfile({
        name: form.name,
        bio: form.bio,
      }),
    )
    status.value = "Profile updated successfully."
  } catch (error) {
    status.value = error instanceof Error ? error.message : "Could not update profile."
  } finally {
    isSaving.value = false
  }
}

const friendNames = computed(() => {
  const user = currentUser.value
  if (!user) {
    return [] as string[]
  }
  const map = new Map(users.value.map((item) => [item.id, item.name]))
  return user.friends
    .map((id) => map.get(id))
    .filter((name): name is string => Boolean(name))
})
</script>

<template>
  <section v-if="currentUser" class="profile">
    <header class="profile__header">
      <UserAvatar :name="currentUser.name" :color="currentUser.avatarColor" :size="80" />
      <div>
        <h1>{{ currentUser.name }}</h1>
        <p>{{ currentUser.email }}</p>
      </div>
    </header>

    <div class="profile__grid">
      <article class="card">
        <h2>About you</h2>
        <form class="profile__form" @submit.prevent="handleSave">
          <label>
            <span>Display name</span>
            <input v-model="form.name" type="text" required />
          </label>

          <label>
            <span>Bio</span>
            <textarea v-model="form.bio" rows="4" placeholder="Share something about yourself"></textarea>
          </label>

          <p v-if="status" class="profile__status">{{ status }}</p>

          <button type="submit" :disabled="isSaving">{{ isSaving ? "Saving..." : "Save changes" }}</button>
        </form>
      </article>

      <article class="card">
        <h2>At a glance</h2>
        <ul class="profile__stats">
          <li>
            <span class="profile__stats-value">{{ currentUser.friends.length }}</span>
            <span class="profile__stats-label">Friends</span>
          </li>
          <li>
            <span class="profile__stats-value">{{ postsByCurrentUser.length }}</span>
            <span class="profile__stats-label">Posts</span>
          </li>
        </ul>

        <div class="profile__friends" v-if="friendNames.length">
          <h3>Connected with</h3>
          <ul>
            <li v-for="name in friendNames" :key="name">{{ name }}</li>
          </ul>
        </div>
        <p v-else class="profile__empty">You have not connected with friends yet.</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.profile {
  width: min(960px, 100%);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile__header {
  display: flex;
  align-items: center;
  gap: 18px;
  background: white;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 18px 48px -42px rgba(15, 23, 42, 0.8);
}

.profile__header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
}

.profile__header p {
  color: #64748b;
}

.profile__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
}

.profile__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile__form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #334155;
  font-weight: 600;
}

.profile__form input,
.profile__form textarea {
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  padding: 12px;
  font-size: 1rem;
}

.profile__form textarea {
  resize: vertical;
  min-height: 120px;
}

.profile__form input:focus,
.profile__form textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
}

.profile__form button {
  align-self: flex-start;
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: white;
  padding: 10px 18px;
  font-weight: 600;
  cursor: pointer;
}

.profile__form button:disabled {
  opacity: 0.7;
  cursor: default;
}

.profile__status {
  color: #22c55e;
  font-weight: 600;
}

.profile__stats {
  display: flex;
  gap: 20px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.profile__stats-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

.profile__stats-label {
  color: #94a3b8;
  font-size: 0.9rem;
}

.profile__friends h3 {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.profile__friends ul {
  list-style: disc;
  padding-left: 22px;
  color: #475569;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile__empty {
  color: #94a3b8;
  font-size: 0.95rem;
}

@media (max-width: 640px) {
  .profile__header {
    flex-direction: column;
    text-align: center;
  }

  .profile__form button {
    align-self: stretch;
  }
}
</style>
