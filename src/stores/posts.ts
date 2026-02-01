import { computed, reactive } from "vue"
import { defineStore, storeToRefs } from "pinia"
import { generateId, loadFromStorage, saveToStorage } from "@/services/storage"
import type { Post } from "@/types"
import { useAuthStore } from "./auth"

const STORAGE_KEY_POSTS = "social_posts"

interface PostsState {
  posts: Post[]
  hasInitialized: boolean
}

const seedPosts: Post[] = [
  {
    id: "post_welcome",
    authorId: "user_demo",
    content:
      "Welcome! This is where your friends' updates will appear. Create a post to let everyone know you have arrived 🚀",
    createdAt: new Date().toISOString(),
    likeUserIds: [],
  },
]

export const usePostsStore = defineStore("posts", () => {
  const state = reactive<PostsState>({
    posts: [],
    hasInitialized: false,
  })

  const authStore = useAuthStore()
  const { currentUser } = storeToRefs(authStore)

  const initialize = () => {
    if (state.hasInitialized) {
      return
    }

    state.posts = loadFromStorage<Post[]>(STORAGE_KEY_POSTS, seedPosts)
    state.hasInitialized = true
  }

  const persist = () => {
    saveToStorage(STORAGE_KEY_POSTS, state.posts)
  }

  const createPost = (content: string) => {
    authStore.initialize()
    if (!currentUser.value) {
      throw new Error("You need to be signed in to post an update.")
    }

    const sanitizedContent = content.trim()
    if (!sanitizedContent) {
      throw new Error("Please share something before posting.")
    }

    const post: Post = {
      id: generateId("post"),
      authorId: currentUser.value.id,
      content: sanitizedContent,
      createdAt: new Date().toISOString(),
      likeUserIds: [],
    }

    state.posts.unshift(post)
    persist()
  }

  const toggleLike = (postId: string) => {
    const user = currentUser.value
    if (!user) {
      return
    }

    const post = state.posts.find((item) => item.id === postId)
    if (!post) {
      return
    }

    if (post.likeUserIds.includes(user.id)) {
      post.likeUserIds = post.likeUserIds.filter((id) => id !== user.id)
    } else {
      post.likeUserIds.push(user.id)
    }

    persist()
  }

  const posts = computed(() => state.posts)

  const feed = computed(() => {
    const user = currentUser.value
    if (!user) {
      return [] as Post[]
    }

    const visibleAuthorIds = new Set<string>([user.id, ...user.friends])
    return state.posts.filter((post) => visibleAuthorIds.has(post.authorId))
  })

  const postsByUser = (userId: string) => computed(() => state.posts.filter((post) => post.authorId === userId))

  return {
    initialize,
    createPost,
    toggleLike,
    posts,
    feed,
    postsByUser,
  }
})
