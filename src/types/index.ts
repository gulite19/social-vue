export interface User {
  id: string
  name: string
  email: string
  password: string
  bio: string
  avatarColor: string
  friends: string[]
}

export interface Post {
  id: string
  authorId: string
  content: string
  createdAt: string
  likeUserIds: string[]
}

export interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  status: "pending" | "accepted" | "declined"
  createdAt: string
}

export interface DirectMessage {
  id: string
  senderId: string
  recipientId: string
  body: string
  createdAt: string
  read: boolean
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface ProfileUpdatePayload {
  name?: string
  bio?: string
}
