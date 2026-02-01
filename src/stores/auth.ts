import { computed, reactive } from "vue"
import { defineStore } from "pinia"
import type { AuthCredentials, ProfileUpdatePayload, User } from "@/types"
import { generateId, loadFromStorage, removeFromStorage, saveToStorage } from "@/services/storage"

const STORAGE_KEY_USERS = "social_users"
const STORAGE_KEY_SESSION = "social_session"

interface AuthState {
  users: User[]
  currentUserId: string | null
  hasInitialized: boolean
  error: string | null
}

const defaultUsers: User[] = [
  {
    id: "user_demo",
    name: "Demo User",
    email: "demo@social.app",
    password: "password123",
    bio: "👋 Welcome to your new social app! Edit your profile to make it yours.",
    avatarColor: "#2563eb",
    friends: [],
  },
]

export const useAuthStore = defineStore("auth", () => {
  const state = reactive<AuthState>({
    users: [],
    currentUserId: null,
    hasInitialized: false,
    error: null,
  })

  const findUserByEmail = (email: string) =>
    state.users.find((user) => user.email.toLowerCase() === email.toLowerCase())

  const initialize = () => {
    if (state.hasInitialized) {
      return
    }

    const storedUsers = loadFromStorage<User[]>(STORAGE_KEY_USERS, defaultUsers)
    const storedSession = loadFromStorage<string | null>(STORAGE_KEY_SESSION, null)

    state.users = storedUsers
    state.currentUserId = storedSession
    state.hasInitialized = true
  }

  const persist = () => {
    saveToStorage(STORAGE_KEY_USERS, state.users)
    if (state.currentUserId) {
      saveToStorage(STORAGE_KEY_SESSION, state.currentUserId)
    } else {
      removeFromStorage(STORAGE_KEY_SESSION)
    }
  }

  const register = (payload: { name: string; email: string; password: string }) => {
    initialize()
    state.error = null

    if (findUserByEmail(payload.email)) {
      state.error = "An account with this email already exists."
      throw new Error(state.error)
    }

    const newUser: User = {
      id: generateId("user"),
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      bio: "Tell the world about yourself.",
      avatarColor: `#${Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0")}`,
      friends: [],
    }

    state.users.push(newUser)
    state.currentUserId = newUser.id
    persist()
  }

  const login = ({ email, password }: AuthCredentials) => {
    initialize()
    state.error = null

    const user = findUserByEmail(email)
    if (!user || user.password !== password) {
      state.error = "Invalid email or password."
      throw new Error(state.error)
    }

    state.currentUserId = user.id
    persist()
  }

  const logout = () => {
    state.currentUserId = null
    persist()
  }

  const updateProfile = (payload: ProfileUpdatePayload) => {
    if (!state.currentUserId) {
      return
    }

    const user = state.users.find((item) => item.id === state.currentUserId)
    if (!user) {
      return
    }

    user.name = payload.name?.trim() || user.name
    user.bio = payload.bio?.trim() || user.bio
    persist()
  }

  const addFriend = (friendId: string) => {
    if (!state.currentUserId || state.currentUserId === friendId) {
      return
    }

    const currentUser = state.users.find((item) => item.id === state.currentUserId)
    const friendUser = state.users.find((item) => item.id === friendId)
    if (!currentUser || !friendUser) {
      return
    }

    if (!currentUser.friends.includes(friendUser.id)) {
      currentUser.friends.push(friendUser.id)
    }

    if (!friendUser.friends.includes(currentUser.id)) {
      friendUser.friends.push(currentUser.id)
    }

    persist()
  }

  const removeFriend = (friendId: string) => {
    if (!state.currentUserId || state.currentUserId === friendId) {
      return
    }

    const currentUser = state.users.find((item) => item.id === state.currentUserId)
    const friendUser = state.users.find((item) => item.id === friendId)
    if (!currentUser || !friendUser) {
      return
    }

    currentUser.friends = currentUser.friends.filter((id) => id !== friendUser.id)
    friendUser.friends = friendUser.friends.filter((id) => id !== currentUser.id)

    persist()
  }

  const resetError = () => {
    state.error = null
  }

  const users = computed(() => state.users)
  const isAuthenticated = computed(() => Boolean(state.currentUserId))
  const currentUser = computed(() => state.users.find((user) => user.id === state.currentUserId) || null)
  const friendDirectory = computed(() =>
    state.users.filter((user) => user.id !== state.currentUserId).map((user) => ({
      ...user,
      isFriend: currentUser.value?.friends.includes(user.id) ?? false,
    })),
  )

  return {
    initialize,
    register,
    login,
    logout,
    updateProfile,
    addFriend,
    removeFriend,
    resetError,
    users,
    currentUser,
    isAuthenticated,
    friendDirectory,
    error: computed(() => state.error),
  }
})
