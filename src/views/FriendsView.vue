<script setup lang="ts">
import { computed, watchEffect } from "vue"
import { useRouter } from "vue-router"
import { storeToRefs } from "pinia"
import { useAuthStore } from "@/stores/auth"
import { useFriendsStore } from "@/stores/friends"
import UserAvatar from "@/components/UserAvatar.vue"

const router = useRouter()
const authStore = useAuthStore()
const friendsStore = useFriendsStore()

authStore.initialize()
friendsStore.initialize()

const { isAuthenticated, currentUser, friendDirectory } = storeToRefs(authStore)
const { incomingRequests, outgoingRequests } = storeToRefs(friendsStore)

watchEffect(() => {
  if (!isAuthenticated.value) {
    router.replace("/login")
  }
})

const directory = computed(() => friendDirectory.value)
const friendList = computed(() => directory.value.filter((user) => user.isFriend))
const suggestedPeople = computed(() => directory.value.filter((user) => !user.isFriend))

const incomingRequestDetails = computed(() =>
  incomingRequests.value.map((request) => ({
    request,
    user: directory.value.find((item) => item.id === request.fromUserId) ?? null,
  })),
)

const outgoingRequestDetails = computed(() =>
  outgoingRequests.value.map((request) => ({
    request,
    user: directory.value.find((item) => item.id === request.toUserId) ?? null,
  })),
)

const sendRequest = (userId: string) => {
  friendsStore.sendRequest(userId)
}

const acceptRequest = (requestId: string) => {
  friendsStore.acceptRequest(requestId)
}

const declineRequest = (requestId: string) => {
  friendsStore.declineRequest(requestId)
}

const cancelRequest = (requestId: string) => {
  friendsStore.cancelRequest(requestId)
}

const removeFriend = (userId: string) => {
  if (confirm("Remove this friend?")) {
    friendsStore.removeFriend(userId)
  }
}

const openMessages = (userId: string) => {
  router.push({ path: "/messages", query: { with: userId } })
}
</script>

<template>
  <section v-if="currentUser" class="friends">
    <div class="friends__column">
      <div class="card">
        <h2>Incoming requests</h2>
        <p v-if="!incomingRequestDetails.some((item) => item.user)" class="card__empty">No pending invites at the moment.</p>
        <ul v-else class="friends__list">
          <li v-for="item in incomingRequestDetails" :key="item.request.id" class="friends__item">
            <template v-if="item.user">
              <div class="friends__identity">
                <UserAvatar :name="item.user.name" :color="item.user.avatarColor" />
                <div>
                  <p class="friends__name">{{ item.user.name }}</p>
                  <p class="friends__meta">Wants to connect</p>
                </div>
              </div>
              <div class="friends__actions">
                <button class="btn btn--primary" type="button" @click="acceptRequest(item.request.id)">Accept</button>
                <button class="btn" type="button" @click="declineRequest(item.request.id)">Decline</button>
              </div>
            </template>
          </li>
        </ul>
      </div>

      <div class="card">
        <h2>Outgoing requests</h2>
        <p v-if="!outgoingRequestDetails.some((item) => item.user)" class="card__empty">You have not sent new requests.</p>
        <ul v-else class="friends__list">
          <li v-for="item in outgoingRequestDetails" :key="item.request.id" class="friends__item">
            <template v-if="item.user">
              <div class="friends__identity">
                <UserAvatar :name="item.user.name" :color="item.user.avatarColor" />
                <div>
                  <p class="friends__name">{{ item.user.name }}</p>
                  <p class="friends__meta">Awaiting a response</p>
                </div>
              </div>
              <button class="btn" type="button" @click="cancelRequest(item.request.id)">Cancel</button>
            </template>
          </li>
        </ul>
      </div>
    </div>

    <div class="friends__column">
      <div class="card">
        <h2>Your friends</h2>
        <p v-if="!friendList.length" class="card__empty">No friends yet—send some requests below.</p>
        <ul v-else class="friends__list">
          <li v-for="friend in friendList" :key="friend.id" class="friends__item">
            <div class="friends__identity">
              <UserAvatar :name="friend.name" :color="friend.avatarColor" />
              <div>
                <p class="friends__name">{{ friend.name }}</p>
                <p class="friends__meta">Connected friend</p>
              </div>
            </div>
            <div class="friends__actions">
              <button class="btn btn--ghost" type="button" @click="openMessages(friend.id)">Message</button>
              <button class="btn" type="button" @click="removeFriend(friend.id)">Remove</button>
            </div>
          </li>
        </ul>
      </div>

      <div class="card">
        <h2>People you may know</h2>
        <p v-if="!suggestedPeople.length" class="card__empty">Everyone is already connected! 🎉</p>
        <ul v-else class="friends__list">
          <li v-for="person in suggestedPeople" :key="person.id" class="friends__item">
            <div class="friends__identity">
              <UserAvatar :name="person.name" :color="person.avatarColor" />
              <div>
                <p class="friends__name">{{ person.name }}</p>
                <p class="friends__meta">Suggested connection</p>
              </div>
            </div>
            <button class="btn btn--primary" type="button" @click="sendRequest(person.id)">Connect</button>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.friends {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  width: min(1100px, 100%);
}

.friends__column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 18px 50px -44px rgba(15, 23, 42, 0.8);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
}

.card__empty {
  color: #94a3b8;
  font-size: 0.95rem;
}

.friends__list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.friends__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.friends__item:last-child {
  border-bottom: none;
}

.friends__identity {
  display: flex;
  gap: 14px;
  align-items: center;
}

.friends__name {
  font-weight: 600;
  color: #1e293b;
}

.friends__meta {
  color: #94a3b8;
  font-size: 0.9rem;
}

.friends__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn {
  border: 1px solid rgba(148, 163, 184, 0.6);
  background: white;
  color: #1f2937;
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn:hover {
  border-color: rgba(99, 102, 241, 0.5);
  color: #4338ca;
}

.btn--primary {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border: none;
  color: white;
}

.btn--primary:hover {
  box-shadow: 0 12px 24px -20px rgba(99, 102, 241, 0.8);
}

.btn--ghost {
  border: none;
  background: rgba(99, 102, 241, 0.12);
  color: #4338ca;
}

.btn--ghost:hover {
  background: rgba(99, 102, 241, 0.18);
}

@media (max-width: 768px) {
  .friends__item {
    flex-direction: column;
    align-items: stretch;
  }

  .friends__actions {
    justify-content: stretch;
  }
}
</style>
