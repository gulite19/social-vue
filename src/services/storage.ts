const isBrowser = typeof window !== "undefined"

const withStorage = <T>(callback: (storage: Storage) => T) => {
  if (!isBrowser) {
    throw new Error("Local storage is not available in this environment.")
  }

  return callback(window.localStorage)
}

export const loadFromStorage = <T>(key: string, fallback: T): T => {
  if (!isBrowser) {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch (error) {
    console.warn(`Failed to load "${key}" from storage`, error)
    return fallback
  }
}

export const saveToStorage = <T>(key: string, value: T): void => {
  if (!isBrowser) {
    return
  }

  try {
    withStorage((storage) => storage.setItem(key, JSON.stringify(value)))
  } catch (error) {
    console.warn(`Failed to persist "${key}" to storage`, error)
  }
}

export const removeFromStorage = (key: string): void => {
  if (!isBrowser) {
    return
  }

  try {
    withStorage((storage) => storage.removeItem(key))
  } catch (error) {
    console.warn(`Failed to remove "${key}" from storage`, error)
  }
}

export const generateId = (prefix = "id"): string => {
  const random = Math.random().toString(36).slice(2, 10)
  const timestamp = Date.now().toString(36)
  return `${prefix}_${timestamp}_${random}`
}
