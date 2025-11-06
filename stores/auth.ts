import { defineStore } from 'pinia'
import type { User } from '~/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated && !!state.user
  },

  actions: {
    async login(username: string, password: string) {
      try {
        this.isLoading = true

        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { username, password }
        })

        if (response.success) {
          this.user = response.data.user
          this.token = response.data.token
          this.isAuthenticated = true

          // 存储到 localStorage
          if (process.client) {
            localStorage.setItem('auth-user', JSON.stringify(response.data.user))
          }

          return { success: true }
        } else {
          return { success: false, error: response.error }
        }
      } catch (error: any) {
        return {
          success: false,
          error: error.data?.error || '登录失败'
        }
      } finally {
        this.isLoading = false
      }
    },

    async register(userData: any) {
      try {
        this.isLoading = true

        const response = await $fetch('/api/auth/register', {
          method: 'POST',
          body: userData
        })

        if (response.success) {
          this.user = response.data.user
          this.token = response.data.token
          this.isAuthenticated = true

          // 存储到 localStorage
          if (process.client) {
            localStorage.setItem('auth-user', JSON.stringify(response.data.user))
          }

          return { success: true }
        } else {
          return { success: false, error: response.error }
        }
      } catch (error: any) {
        return {
          success: false,
          error: error.data?.error || '注册失败'
        }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        await $fetch('/api/auth/logout', {
          method: 'POST'
        })
      } catch (error) {
        console.error('退出登录错误:', error)
      } finally {
        this.user = null
        this.token = null
        this.isAuthenticated = false

        // 清除 localStorage
        if (process.client) {
          localStorage.removeItem('auth-user')
        }

        // 重定向到登录页
        await navigateTo('/admin/login')
      }
    },

    async fetchUser() {
      try {
        const response = await $fetch('/api/auth/me')

        if (response.success) {
          this.user = response.data.user
          this.isAuthenticated = true

          if (process.client) {
            localStorage.setItem('auth-user', JSON.stringify(response.data.user))
          }
        }
      } catch (error) {
        this.user = null
        this.isAuthenticated = false

        if (process.client) {
          localStorage.removeItem('auth-user')
        }
      }
    },

    // 从 localStorage 恢复用户状态
    restoreUser() {
      if (process.client) {
        const storedUser = localStorage.getItem('auth-user')
        if (storedUser) {
          try {
            this.user = JSON.parse(storedUser)
            this.isAuthenticated = true
          } catch (error) {
            localStorage.removeItem('auth-user')
          }
        }
      }
    }
  }
})