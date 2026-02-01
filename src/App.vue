<script setup lang="ts">
import { computed, onMounted } from "vue"
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import { useAuthStore } from "@/stores/auth"
import UserAvatar from "@/components/UserAvatar.vue"

const authStore = useAuthStore()
const { isAuthenticated, currentUser } = storeToRefs(authStore)
const router = useRouter()
const route = useRoute()

onMounted(() => {
  authStore.initialize()
})

const navLinks = computed(() => {
  if (!currentUser.value) {
    return [] as Array<{ label: string; to: string; icon: string }>
  }

  return [
    { label: "Feed", to: "/feed", icon: "📰" },
    { label: "Friends", to: "/friends", icon: "🤝" },
    { label: "Messages", to: "/messages", icon: "💬" },
    { label: "Profile", to: "/profile", icon: "👤" },
  ]
})

const handleLogout = () => {
  authStore.logout()
  router.push("/login")
}
</script>

<template>
  <div class="app">
    <header class="app__header">
      <RouterLink class="app__brand" to="/" aria-label="Social home">
        <span class="app__brand-mark">social<span>vue</span></span>
      </RouterLink>

      <nav v-if="isAuthenticated" class="app__nav" aria-label="Main navigation">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="app__nav-link"
          :class="{ 'app__nav-link--active': route.path === link.to }"
        >
          <span aria-hidden="true">{{ link.icon }}</span>
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="app__auth">
        <template v-if="isAuthenticated && currentUser">
          <div class="app__user">
            <UserAvatar :name="currentUser.name" :color="currentUser.avatarColor" :size="40" />
            <div class="app__user-meta">
              <span class="app__user-name">{{ currentUser.name }}</span>
              <RouterLink class="app__user-email" to="/profile">{{ currentUser.email }}</RouterLink>
            </div>
          </div>
          <button class="app__logout" type="button" @click="handleLogout">Log out</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="app__cta">Log in</RouterLink>
          <RouterLink to="/register" class="app__cta app__cta--primary">Join now</RouterLink>
        </template>
      </div>
    </header>

    <main class="app__main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  color: #0f172a;
  display: flex;
  flex-direction: column;
}

.app__header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.3);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
  padding: 16px 32px;
}

.app__brand {
  text-decoration: none;
}

.app__brand-mark {
  font-weight: 700;
  font-size: 1.4rem;
  letter-spacing: 0.04em;
  color: #1d4ed8;
}

.app__brand-mark span {
  color: #6366f1;
}

.app__nav {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.app__nav-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 999px;
  text-decoration: none;
  color: #334155;
  font-weight: 600;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.app__nav-link:hover {
  background-color: rgba(99, 102, 241, 0.12);
  color: #4338ca;
}

.app__nav-link--active {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 12px 18px -16px rgba(99, 102, 241, 0.7);
}

.app__auth {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app__user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app__user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.app__user-name {
  font-weight: 600;
  color: #0f172a;
}

.app__user-email {
  font-size: 0.85rem;
  color: #64748b;
  text-decoration: none;
}

.app__user-email:hover {
  color: #4338ca;
}

.app__logout {
  border: none;
  background: rgba(226, 232, 240, 0.7);
  border-radius: 999px;
  padding: 9px 16px;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.app__logout:hover {
  background-color: rgba(148, 163, 184, 0.35);
}

.app__cta {
  text-decoration: none;
  font-weight: 600;
  color: #4338ca;
  padding: 8px 14px;
  border-radius: 999px;
  transition: background-color 0.15s ease;
}

.app__cta:hover {
  background-color: rgba(99, 102, 241, 0.12);
}

.app__cta--primary {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 10px 18px -16px rgba(99, 102, 241, 0.7);
}

.app__main {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 32px 16px 48px;
}

@media (max-width: 960px) {
  .app__header {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 16px;
  }

  .app__auth {
    order: 3;
    flex-direction: column;
  }
}
</style>
