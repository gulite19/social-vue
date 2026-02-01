<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from "vue"
import { useRoute, useRouter } from "vue-router"
import { formatDistanceToNow } from "date-fns"
import { storeToRefs } from "pinia"
import { useAuthStore } from "@/stores/auth"
import { useFriendsStore } from "@/stores/friends"
import { useMessagesStore } from "@/stores/messages"
import UserAvatar from "@/components/UserAvatar.vue"

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const friendsStore = useFriendsStore()
const messagesStore = useMessagesStore()

authStore.initialize()
friendsStore.initialize()
messagesStore.initialize()

const { isAuthenticated, friendDirectory, currentUser } = storeToRefs(authStore)
const currentUserId = computed(() => currentUser.value?.id ?? null)
const { conversations } = storeToRefs(messagesStore)

const selectedUserId = ref<string | null>(null)

watchEffect(() => {
  if (!isAuthenticated.value) {
    router.replace("/login")
  }
})

watchEffect(() => {
  const withUser = route.query.with
  if (typeof withUser === "string") {
    selectedUserId.value = withUser
    messagesStore.markConversationAsRead(withUser)
  }
})

const friends = computed(() => friendDirectory.value.filter((friend) => friend.isFriend))

const conversationSummaries = computed(() =>
  conversations.value.map((conversation) => ({
    ...conversation,
    user: friendDirectory.value.find((friend) => friend.id === conversation.userId) ?? null,
  })),
)

const form = reactive({
  body: "",
})

const activeFriend = computed(() => friendDirectory.value.find((friend) => friend.id === selectedUserId.value) ?? null)

const activeConversation = computed(() => {
  const participantId = selectedUserId.value
  if (!participantId) {
    return []
  }
  return messagesStore.conversationWith(participantId).value
})

watchEffect(() => {
  if (selectedUserId.value) {
    messagesStore.markConversationAsRead(selectedUserId.value)
  }
})

const selectConversation = (userId: string) => {
  selectedUserId.value = userId
  router.replace({ path: "/messages", query: { with: userId } })
}

const sendMessage = () => {
  if (!selectedUserId.value || !form.body.trim()) {
    return
  }

  messagesStore.sendMessage(selectedUserId.value, form.body)
  form.body = ""
}
</script>

<template>
  <section class="messages">
    <aside class="messages__sidebar" aria-label="Conversation list">
      <header class="messages__sidebar-header">
        <h2>Conversations</h2>
        <p>{{ friends.length }} friend{{ friends.length === 1 ? "" : "s" }}</p>
      </header>

      <ul class="messages__conversation-list">
        <li
          v-for="friend in friends"
          :key="friend.id"
          class="messages__conversation"
          :class="{ 'messages__conversation--active': friend.id === selectedUserId }"
          @click="selectConversation(friend.id)"
        >
          <UserAvatar :name="friend.name" :color="friend.avatarColor" :size="40" />
          <div class="messages__conversation-content">
            <div class="messages__conversation-row">
              <span class="messages__conversation-name">{{ friend.name }}</span>
              <span class="messages__conversation-time">
                {{
                  formatDistanceToNow(
                    new Date(
                      conversationSummaries.find((item) => item.user?.id === friend.id)?.lastMessage?.createdAt ||
                        Date.now(),
                    ),
                    { addSuffix: true },
                  )
                }}
              </span>
            </div>
            <p class="messages__conversation-preview">
              {{ conversationSummaries.find((item) => item.user?.id === friend.id)?.lastMessage?.body ?? "Start a chat" }}
            </p>
          </div>
          <span
            v-if="conversationSummaries.find((item) => item.user?.id === friend.id)?.unreadCount"
            class="messages__badge"
          >
            {{ conversationSummaries.find((item) => item.user?.id === friend.id)?.unreadCount }}
          </span>
        </li>
      </ul>
    </aside>

    <article class="messages__thread" aria-live="polite">
      <template v-if="activeFriend">
        <header class="messages__thread-header">
          <div class="messages__thread-recipient">
            <UserAvatar :name="activeFriend.name" :color="activeFriend.avatarColor" :size="48" />
            <div>
              <h2>{{ activeFriend.name }}</h2>
              <p>Connected friend</p>
            </div>
          </div>
        </header>

        <div class="messages__history">
          <div
            v-for="message in activeConversation"
            :key="message.id"
            class="messages__bubble"
            :class="{
              'messages__bubble--outgoing': message.senderId === currentUserId,
            }"
          >
            <p>{{ message.body }}</p>
            <time>{{ formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }) }}</time>
          </div>
        </div>

        <form class="messages__composer" @submit.prevent="sendMessage">
          <textarea v-model="form.body" rows="2" placeholder="Type your message..." />
          <button type="submit" :disabled="!form.body.trim()">Send</button>
        </form>
      </template>

      <div v-else class="messages__empty">
        <h2>Select a conversation</h2>
        <p>Pick a friend from the list to start chatting.</p>
      </div>
    </article>
  </section>
</template>

<style scoped>
.messages {
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
  gap: 24px;
  width: min(1200px, 100%);
}

.messages__sidebar {
  background: white;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
}

.messages__sidebar-header {
  padding: 0 20px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.messages__sidebar-header h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
}

.messages__sidebar-header p {
  color: #94a3b8;
  font-size: 0.9rem;
}

.messages__conversation-list {
  overflow-y: auto;
  padding: 0;
  margin: 0;
  list-style: none;
}

.messages__conversation {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.messages__conversation:hover {
  background-color: rgba(99, 102, 241, 0.1);
}

.messages__conversation--active {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.12), rgba(99, 102, 241, 0.08));
}

.messages__conversation-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.messages__conversation-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.messages__conversation-name {
  font-weight: 600;
  color: #1e293b;
}

.messages__conversation-time {
  font-size: 0.78rem;
  color: #94a3b8;
}

.messages__conversation-preview {
  font-size: 0.88rem;
  color: #64748b;
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.messages__badge {
  min-width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #ef4444;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.messages__thread {
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
}

.messages__thread-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.messages__thread-recipient {
  display: flex;
  gap: 14px;
  align-items: center;
}

.messages__thread-recipient h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
}

.messages__thread-recipient p {
  color: #94a3b8;
  font-size: 0.9rem;
}

.messages__history {
  flex: 1;
  overflow-y: auto;
  padding: 24px 24px 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.messages__bubble {
  max-width: 70%;
  background: rgba(148, 163, 184, 0.16);
  border-radius: 16px;
  padding: 12px 16px;
  align-self: flex-start;
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
  color: #1f2937;
}

.messages__bubble--outgoing {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: white;
  align-self: flex-end;
}

.messages__bubble time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.messages__composer {
  display: flex;
  gap: 12px;
  padding: 16px 24px 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

.messages__composer textarea {
  flex: 1;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  padding: 12px;
  font-size: 0.95rem;
  resize: none;
}

.messages__composer textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
}

.messages__composer button {
  border: none;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: white;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
}

.messages__composer button:disabled {
  opacity: 0.6;
  cursor: default;
}

.messages__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748b;
}

@media (max-width: 960px) {
  .messages {
    grid-template-columns: 1fr;
  }

  .messages__sidebar {
    height: auto;
    border-radius: 16px;
  }

  .messages__thread {
    height: auto;
  }
}
</style>
