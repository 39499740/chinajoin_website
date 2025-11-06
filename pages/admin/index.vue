<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">仪表盘</h1>
      <p class="text-gray-600 mt-1">欢迎回来，{{ authStore.user?.username }}！</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-blue-100 rounded-lg p-3">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">新闻总数</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.newsCount }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-green-100 rounded-lg p-3">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">分类数量</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.categoryCount }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-purple-100 rounded-lg p-3">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">媒体文件</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.mediaCount }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-orange-100 rounded-lg p-3">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">用户数量</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.userCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近新闻 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">最近新闻</h2>
          <NuxtLink
            to="/admin/news"
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            查看全部
          </NuxtLink>
        </div>

        <div v-if="loading" class="text-center py-8 text-gray-500">
          加载中...
        </div>

        <div v-else-if="recentNews.length === 0" class="text-center py-8 text-gray-500">
          暂无新闻
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="news in recentNews"
            :key="news.id"
            class="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div class="flex-1">
              <h3 class="font-medium text-gray-900">{{ news.title }}</h3>
              <p class="text-sm text-gray-600 mt-1">
                {{ news.excerpt || news.content.substring(0, 100) }}...
              </p>
              <div class="flex items-center mt-2 text-xs text-gray-500">
                <span>{{ formatDate(news.createdAt) }}</span>
                <span class="mx-2">•</span>
                <span
                  class="px-2 py-1 rounded-full text-xs"
                  :class="getStatusClass(news.status)"
                >
                  {{ getStatusText(news.status) }}
                </span>
              </div>
            </div>
            <div class="ml-4">
              <NuxtLink
                :to="`/admin/news/${news.id}/edit`"
                class="text-blue-600 hover:text-blue-800"
              >
                编辑
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统信息 -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">系统信息</h2>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">系统版本</span>
            <span class="font-medium">v1.0.0</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Node.js 版本</span>
            <span class="font-medium">{{ systemInfo.nodeVersion }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">数据库状态</span>
            <span class="font-medium text-green-600">正常</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">最后登录</span>
            <span class="font-medium">{{ formatDate(new Date()) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

// 设置页面标题
useHead({
  title: '仪表盘 - ChinaJoin CMS'
})

const authStore = useAuthStore()

// 状态
const loading = ref(true)
const stats = ref({
  newsCount: 0,
  categoryCount: 0,
  mediaCount: 0,
  userCount: 0
})
const recentNews = ref([])
const systemInfo = ref({
  nodeVersion: process.version || 'Unknown'
})

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await $fetch('/api/admin/stats')
    if (response.success) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取最近新闻
const fetchRecentNews = async () => {
  try {
    const response = await $fetch('/api/admin/news?limit=5')
    if (response.success) {
      recentNews.value = response.data
    }
  } catch (error) {
    console.error('获取最近新闻失败:', error)
  }
}

// 格式化日期
const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态样式
const getStatusClass = (status) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800'
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'archived':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'published':
      return '已发布'
    case 'draft':
      return '草稿'
    case 'archived':
      return '已归档'
    default:
      return '未知'
  }
}

// 页面加载时获取数据
onMounted(async () => {
  loading.value = true

  await Promise.all([
    fetchStats(),
    fetchRecentNews()
  ])

  loading.value = false
})
</script>