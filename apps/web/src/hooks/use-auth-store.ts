import { create } from "zustand"
import { persist } from "zustand/middleware"
import { loginUser, registerUser, getCurrentUser } from "../lib/auth"
import type { User } from "../types"

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null

  register: (email: string, password: string, name: string, role?: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      register: async (email: string, password: string, name: string, role?: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await registerUser(email, password, name, role)
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
          })
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await loginUser(email, password)
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
          })
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null,
        })
      },

      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const user = await getCurrentUser()
          if (user) {
            set({ user, isLoading: false })
          } else {
            // Only clear user if we got an explicit "Unauthorized" response
            // Don't clear on network errors - keep existing user in store
            const currentUser = useAuthStore.getState().user
            if (!currentUser) {
              // Only clear if there was no user to begin with
              set({ user: null, accessToken: null, refreshToken: null, isLoading: false })
            } else {
              // Keep existing user, just stop loading
              set({ isLoading: false })
            }
          }
        } catch (error) {
          // On network errors, don't clear the user - keep existing auth state
          console.warn("checkAuth error (keeping existing user):", error)
          const currentUser = useAuthStore.getState().user
          if (currentUser) {
            // Keep existing user on network errors
            set({ isLoading: false })
          } else {
            // Only clear if there was no user to begin with
            set({ user: null, accessToken: null, refreshToken: null, isLoading: false })
          }
        }
      },

      setUser: (user: User | null) => {
        set({ user })
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
)
