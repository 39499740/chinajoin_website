<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 侧边栏 -->
    <div class="flex">
      <!-- 侧边栏导航 -->
      <aside class="w-64 bg-gray-900 text-white min-h-screen">
        <div class="p-6">
          <h1 class="text-2xl font-bold text-center">ChinaJoin CMS</h1>
          <p class="text-gray-400 text-sm text-center mt-2">内容管理系统</p>
        </div>

        <nav class="mt-6">
          <ul class="space-y-2 px-4">
            <li>
              <NuxtLink
                to="/admin"
                class="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                :class="{ 'bg-gray-800': $route.path === '/admin' }"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                仪表盘
              </NuxtLink>
            </li>

            <li>
              <NuxtLink
                to="/admin/news"
                class="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                :class="{ 'bg-gray-800': $route.path.startsWith('/admin/news') }"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                新闻管理
              </NuxtLink>
            </li>

            <li>
              <NuxtLink
                to="/admin/categories"
                class="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                :class="{ 'bg-gray-800': $route.path.startsWith('/admin/categories') }"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                分类管理
              </NuxtLink>
            </li>

            <li>
              <NuxtLink
                to="/admin/media"
                class="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                :class="{ 'bg-gray-800': $route.path.startsWith('/admin/media') }"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                媒体管理
              </NuxtLink>
            </li>

            <li>
              <NuxtLink
                to="/admin/users"
                class="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                :class="{ 'bg-gray-800': $route.path.startsWith('/admin/users') }"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                用户管理
              </NuxtLink>
            </li>

            <li>
              <NuxtLink
                to="/admin/settings"
                class="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                :class="{ 'bg-gray-800': $route.path.startsWith('/admin/settings') }"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                网站设置
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- 用户信息和退出登录 -->
        <div class="absolute bottom-0 w-64 p-4 border-t border-gray-800">
          <div class="flex items-center mb-3">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <span class="text-white text-sm font-semibold">
                {{ authStore.user?.username?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">{{ authStore.user?.username }}</p>
              <p class="text-xs text-gray-400">{{ authStore.user?.email }}</p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          >
            退出登录
          </button>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <div class="flex-1">
        <!-- 顶部导航栏 -->
        <header class="bg-white shadow-sm border-b border-gray-200">
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <h2 class="text-xl font-semibold text-gray-800">
                  {{ pageTitle }}
                </h2>
              </div>

              <div class="flex items-center space-x-4">
                <NuxtLink
                  to="/"
                  class="text-gray-600 hover:text-gray-900 transition-colors"
                  target="_blank"
                >
                  <span class="text-sm">查看网站</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </header>

        <!-- 页面内容 -->
        <main class="p-6">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

// 使用中间件
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()

// 页面标题
const pageTitle = computed(() => {
  const route = useRoute()
  const path = route.path

  if (path === '/admin') return '仪表盘'
  if (path.startsWith('/admin/news')) return '新闻管理'
  if (path.startsWith('/admin/categories')) return '分类管理'
  if (path.startsWith('/admin/media')) return '媒体管理'
  if (path.startsWith('/admin/users')) return '用户管理'
  if (path.startsWith('/admin/settings')) return '网站设置'

  return '管理后台'
})

// 退出登录
const handleLogout = async () => {
  await authStore.logout()
}

// 页面加载时获取用户信息
onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchUser()
  }
})
</script>