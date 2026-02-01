import { computed, reactive } from "vue"
import { defineStore, storeToRefs } from "pinia"
import type { DirectMessage } from "@/types"
import { generateId, loadFromStorage, saveToStorage } from "@/services/storage"
import { useAuthStore } from "./auth"

const STORAGE_KEY_MESSAGES = "social_messages"

interface MessagesState {
  messages: DirectMessage[]
  hasInitialized: boolean
}

export const useMessagesStore = defineStore("messages", () => {
  const state = reactive<MessagesState>({
    messages: [],
    hasInitialized: false,
  })

  const authStore = useAuthStore()
  const { currentUser } = storeToRefs(authStore)

  const initialize = () => {
    if (state.hasInitialized) {
      return
    }

    state.messages = loadFromStorage<DirectMessage[]>(STORAGE_KEY_MESSAGES, [])
    state.hasInitialized = true
  }

  const persist = () => {
    saveToStorage(STORAGE_KEY_MESSAGES, state.messages)
  }

  const sendMessage = (recipientId: string, body: string) => {
    const sender = currentUser.value
    if (!sender) {
      throw new Error("Only signed in users can send messages.")
    }

    const sanitizedBody = body.trim()
    if (!sanitizedBody) {
      throw new Error("Messages cannot be empty.")
    }

    state.messages.push({
      id: generateId("message"),
      senderId: sender.id,
      recipientId,
      body: sanitizedBody,
      createdAt: new Date().toISOString(),
      read: sender.id === recipientId,
    })

    persist()
  }

  const markConversationAsRead = (otherUserId: string) => {
    const user = currentUser.value
    if (!user) {
      return
    }

    let hasChanges = false
    state.messages.forEach((message) => {
      if (message.recipientId === user.id && message.senderId === otherUserId && !message.read) {
        message.read = true
        hasChanges = true
      }
    })

    if (hasChanges) {
      persist()
    }
  }

  const conversationWith = (otherUserId: string) =>
    computed(() => {
      const user = currentUser.value
      if (!user) {
        return [] as DirectMessage[]
      }

      return state.messages
        .filter(
          (message) =>
            (message.senderId === user.id && message.recipientId === otherUserId) ||
            (message.recipientId === user.id && message.senderId === otherUserId),
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    })

  const conversations = computed(() => {
    const user = currentUser.value
    if (!user) {
      return [] as {
        userId: string
        messages: DirectMessage[]
        lastMessage: DirectMessage | null
        unreadCount: number
      }[]
    }

    const map = new Map<string, DirectMessage[]>()
    state.messages.forEach((message) => {
      if (message.senderId !== user.id && message.recipientId !== user.id) {
        return
      }

      const otherUserId = message.senderId === user.id ? message.recipientId : message.senderId
      if (!map.has(otherUserId)) {
        map.set(otherUserId, [])
      }
      map.get(otherUserId)?.push(message)
    })

    return Array.from(map.entries()).map(([userId, messages]) => {
      const sortedMessages = messages
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      const unreadCount = sortedMessages.filter((message) => message.recipientId === user.id && !message.read).length

      return {
        userId,
        messages: sortedMessages,
        lastMessage: sortedMessages[0] ?? null,
        unreadCount,
      }
    })
  })

  return {
    initialize,
    sendMessage,
    markConversationAsRead,
    conversationWith,
    conversations,
    allMessages: computed(() => state.messages),
  }
})
