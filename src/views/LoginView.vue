<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from "vue"
import { RouterLink, useRoute, useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import { useAuthStore } from "@/stores/auth"

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
authStore.initialize()

const { isAuthenticated } = storeToRefs(authStore)

const form = reactive({
  email: "demo@social.app",
  password: "password123",
})

const isSubmitting = ref(false)
const localError = ref<string | null>(null)

const redirectPath = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === "string" ? redirect : "/feed"
})

watchEffect(() => {
  if (isAuthenticated.value) {
    router.replace(redirectPath.value)
  }
})

const handleSubmit = async () => {
  if (isSubmitting.value) {
    return
  }

  localError.value = null

  try {
    isSubmitting.value = true
    authStore.resetError()
    await Promise.resolve(
      authStore.login({
        email: form.email,
        password: form.password,
      }),
    )

    router.replace(redirectPath.value)
  } catch (error) {
    localError.value =
      error instanceof Error ? error.message : "We could not sign you in. Please try again."
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="auth auth--login">
    <header class="auth__header">
      <h1>Welcome back</h1>
      <p>Sign in to see what friends have been up to.</p>
    </header>

    <form class="auth__form" @submit.prevent="handleSubmit">
      <label class="auth__field">
        <span>Email</span>
        <input v-model="form.email" type="email" required autocomplete="email" placeholder="you@example.com" />
      </label>

      <label class="auth__field">
        <span>Password</span>
        <input
          v-model="form.password"
          type="password"
          required
          autocomplete="current-password"
          placeholder="Enter your password"
        />
      </label>

      <p v-if="localError" class="auth__error">{{ localError }}</p>
      <p v-else class="auth__hint">Demo login: demo@social.app / password123</p>

      <button class="auth__submit" type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? "Signing in..." : "Sign in" }}
      </button>
    </form>

    <footer class="auth__footer">
      <p>
        New here?
        <RouterLink to="/register">Create an account</RouterLink>
      </p>
    </footer>
  </section>
</template>

<style scoped>
.auth {
  width: min(420px, 100%);
  background: white;
  border-radius: 20px;
  padding: 36px 32px;
  box-shadow:
    0 20px 60px -40px rgba(15, 23, 42, 0.8),
    0 1px 2px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.2);
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 24px auto;
}

.auth__header h1 {
  font-size: 1.9rem;
  font-weight: 700;
  color: #1e293b;
}

.auth__header p {
  color: #64748b;
}

.auth__form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.auth__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  color: #334155;
}

.auth__field input {
  appearance: none;
  border: 1px solid rgba(148, 163, 184, 0.6);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 1rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.auth__field input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.auth__error {
  color: #ef4444;
  font-weight: 600;
}

.auth__hint {
  color: #94a3b8;
  font-size: 0.9rem;
}

.auth__submit {
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  padding: 12px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.auth__submit:disabled {
  opacity: 0.7;
  cursor: default;
}

.auth__submit:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px -26px rgba(99, 102, 241, 0.8);
}

.auth__footer {
  text-align: center;
  color: #64748b;
  font-size: 0.95rem;
}

.auth__footer a {
  color: #4338ca;
  font-weight: 600;
  text-decoration: none;
}

.auth__footer a:hover {
  text-decoration: underline;
}
</style>
