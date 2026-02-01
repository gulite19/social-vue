import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/feed",
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
      meta: { public: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/views/RegisterView.vue"),
      meta: { public: true },
    },
    {
      path: "/feed",
      name: "feed",
      component: () => import("@/views/FeedView.vue"),
    },
    {
      path: "/friends",
      name: "friends",
      component: () => import("@/views/FriendsView.vue"),
    },
    {
      path: "/messages",
      name: "messages",
      component: () => import("@/views/MessagesView.vue"),
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("@/views/ProfileView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
      meta: { public: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.initialize()

  const isPublicRoute = Boolean(to.meta.public)
  const isAuthenticated = authStore.isAuthenticated

  if (isAuthenticated && (to.name === "login" || to.name === "register")) {
    next((to.query.redirect as string) || "/feed")
    return
  }

  if (!isAuthenticated && !isPublicRoute) {
    next({ path: "/login", query: { redirect: to.fullPath } })
    return
  }

  next()
})

export default router
