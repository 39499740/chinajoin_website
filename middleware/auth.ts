import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // 恢复用户状态（仅在客户端）
  if (process.client) {
    authStore.restoreUser()
  }

  // 如果用户未登录，重定向到登录页
  if (!authStore.isLoggedIn) {
    // 尝试从服务器获取用户信息
    await authStore.fetchUser()
  }

  // 检查是否是运维端路由
  if (to.path.startsWith('/admin')) {
    // 如果是登录页，且用户已登录，重定向到管理后台首页
    if (to.path === '/admin/login' && authStore.isLoggedIn) {
      return navigateTo('/admin')
    }

    // 如果不是登录页，且用户未登录，重定向到登录页
    if (to.path !== '/admin/login' && !authStore.isLoggedIn) {
      return navigateTo('/admin/login')
    }
  }
})