import { computed, reactive } from "vue"
import { defineStore, storeToRefs } from "pinia"
import type { FriendRequest } from "@/types"
import { generateId, loadFromStorage, saveToStorage } from "@/services/storage"
import { useAuthStore } from "./auth"

const STORAGE_KEY_FRIEND_REQUESTS = "social_friend_requests"

interface FriendsState {
  requests: FriendRequest[]
  hasInitialized: boolean
}

export const useFriendsStore = defineStore("friends", () => {
  const state = reactive<FriendsState>({
    requests: [],
    hasInitialized: false,
  })

  const authStore = useAuthStore()
  const { currentUser } = storeToRefs(authStore)

  const initialize = () => {
    if (state.hasInitialized) {
      return
    }

    state.requests = loadFromStorage<FriendRequest[]>(STORAGE_KEY_FRIEND_REQUESTS, [])
    state.hasInitialized = true
  }

  const persist = () => {
    saveToStorage(STORAGE_KEY_FRIEND_REQUESTS, state.requests)
  }

  const sendRequest = (targetUserId: string) => {
    const user = currentUser.value
    if (!user || user.id === targetUserId) {
      return
    }

    initialize()

    if (user.friends.includes(targetUserId)) {
      return
    }

    const existingRequest = state.requests.find(
      (request) =>
        request.status === "pending" &&
        ((request.fromUserId === user.id && request.toUserId === targetUserId) ||
          (request.toUserId === user.id && request.fromUserId === targetUserId)),
    )

    if (existingRequest) {
      return
    }

    state.requests.push({
      id: generateId("friendrequest"),
      fromUserId: user.id,
      toUserId: targetUserId,
      status: "pending",
      createdAt: new Date().toISOString(),
    })

    persist()
  }

  const acceptRequest = (requestId: string) => {
    const request = state.requests.find((item) => item.id === requestId && item.status === "pending")
    if (!request) {
      return
    }

    authStore.addFriend(request.fromUserId)
    request.status = "accepted"
    persist()
  }

  const declineRequest = (requestId: string) => {
    const request = state.requests.find((item) => item.id === requestId && item.status === "pending")
    if (!request) {
      return
    }

    request.status = "declined"
    persist()
  }

  const cancelRequest = (requestId: string) => {
    state.requests = state.requests.filter((item) => item.id !== requestId)
    persist()
  }

  const removeFriend = (userId: string) => {
    authStore.removeFriend(userId)
  }

  const outgoingRequests = computed(() => {
    const user = currentUser.value
    if (!user) {
      return [] as FriendRequest[]
    }
    return state.requests.filter((request) => request.fromUserId === user.id && request.status === "pending")
  })

  const incomingRequests = computed(() => {
    const user = currentUser.value
    if (!user) {
      return [] as FriendRequest[]
    }
    return state.requests.filter((request) => request.toUserId === user.id && request.status === "pending")
  })

  return {
    initialize,
    sendRequest,
    acceptRequest,
    declineRequest,
    cancelRequest,
    removeFriend,
    incomingRequests,
    outgoingRequests,
    allRequests: computed(() => state.requests),
  }
})
