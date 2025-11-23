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
    (set, get) => ({
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
            set({ user: null, accessToken: null, refreshToken: null, isLoading: false })
          }
        } catch (error) {
          set({ user: null, accessToken: null, refreshToken: null, isLoading: false })
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
