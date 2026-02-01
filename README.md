# Social Vue

A lightweight social networking prototype built with Vue 3, Vite 7, TypeScript, Vue Router, and Pinia. It ships with client-side authentication, a feed for posting updates, friend connections, direct messaging, and profile management - all powered by localStorage so it runs without a backend.

## Features

- **Authentication**: Sign up, log in, and session persistence (demo credentials ready to go).
- **News Feed**: Create posts, view updates from friends, and react with likes.
- **Friend Connections**: Send, accept, decline, and cancel requests with real-time state updates.
- **Direct Messages**: Keep side-by-side conversations with unread indicators and history.
- **Profile Management**: Edit your display name and bio; view quick stats on posts and friends.

## Quick Start

```sh
npm install
npm run dev
```

Default demo login:

```
Email:    demo@social.app
Password: password123
```

> **Node requirement**: Vite 7 requires Node.js ^20.19.0 (or >=22.12.0). Update your runtime if you encounter an engine warning when installing or building.

## Available Scripts

| Script             | Description                                        |
| ------------------ | -------------------------------------------------- |
| `npm run dev`      | Start the Vite dev server with hot module reload.  |
| `npm run build`    | Type-check with `vue-tsc` then produce a prod build. |
| `npm run preview`  | Preview the production build locally.              |
| `npm run lint`     | Run ESLint over source files.                      |

## Tech Notes

- State is handled with Pinia stores that wrap localStorage for persistence. Clearing browser storage resets the demo data.
- The UI uses composition-friendly components (`UserAvatar`, `PostComposer`, `PostCard`) and modern layout utilities.
- No backend is included - swap the persistence helpers or Pinia actions to integrate real APIs.

## Next Steps

- Wire the Pinia actions (`auth`, `posts`, `friends`, `messages`) to your API layer.
- Replace localStorage persistence with real authentication and database storage.
- Expand messaging with typing indicators, attachments, or read receipts as needed.
- Add automated tests (unit + component) before moving to production scenarios.
