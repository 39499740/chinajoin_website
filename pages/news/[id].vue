<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-xl font-bold text-primary-color">
              ChinaJoin
            </NuxtLink>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink to="/" class="text-gray-600 hover:text-primary-color transition-colors">
              返回首页
            </NuxtLink>
            <NuxtLink
              v-if="authStore?.isAuthenticated"
              to="/admin/news"
              class="text-gray-600 hover:text-primary-color transition-colors"
            >
              管理后台
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="loading-spinner w-8 h-8"></div>
        <span class="ml-3 text-gray-600">加载中...</span>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-12">
        <Icon name="AlertCircle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-gray-900 mb-2">新闻不存在</h1>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <NuxtLink to="/" class="btn btn-primary">
          返回首页
        </NuxtLink>
      </div>

      <!-- 文章内容 -->
      <article v-else-if="news" class="bg-white rounded-xl shadow-sm overflow-hidden">
        <!-- 文章头部 -->
        <header class="p-6 sm:p-8 border-b border-gray-200">
          <!-- 分类标签 -->
          <div class="mb-4">
            <span
              v-if="news.category"
              class="tag tag-primary"
            >
              {{ news.category.name }}
            </span>
            <span
              :class="getStatusClass(news.status)"
              class="tag ml-2"
            >
              {{ getStatusText(news.status) }}
            </span>
          </div>

          <!-- 标题 -->
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {{ news.title }}
          </h1>

          <!-- 元信息 -->
          <div class="flex flex-wrap items-center text-sm text-gray-500 space-x-4 sm:space-x-6">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                <span class="text-sm font-medium text-gray-600">
                  {{ news.author?.username?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <span class="font-medium">{{ news.author?.username }}</span>
            </div>
            <span>•</span>
            <time :datetime="news.publishedAt">
              {{ formatDate(news.publishedAt) }}
            </time>
            <span>•</span>
            <span>阅读量：{{ formatNumber(news.viewCount || 0) }}</span>
          </div>
        </header>

        <!-- 特色图片 -->
        <div v-if="news.featuredImage" class="aspect-video bg-gray-100">
          <img
            :src="news.featuredImage"
            :alt="news.title"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <!-- 文章内容 -->
        <div class="p-6 sm:p-8">
          <!-- 摘要 -->
          <div v-if="news.excerpt" class="text-lg text-gray-600 leading-relaxed mb-8 p-4 bg-gray-50 rounded-lg">
            {{ news.excerpt }}
          </div>

          <!-- 正文内容 -->
          <div
            class="prose prose-lg max-w-none"
            v-html="renderedContent"
          />

          <!-- 分享按钮 -->
          <div class="mt-12 pt-8 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-500">
                发布于 {{ formatDate(news.createdAt) }}
                <span v-if="news.updatedAt !== news.createdAt">
                  • 最后修改于 {{ formatDate(news.updatedAt) }}
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="shareToWeibo"
                  class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="分享到微博"
                >
                  <Icon name="Share2" class="w-5 h-5" />
                </button>
                <button
                  @click="shareToWechat"
                  class="p-2 text-gray-400 hover:text-green-500 transition-colors"
                  title="分享到微信"
                >
                  <Icon name="Share2" class="w-5 h-5" />
                </button>
                <button
                  @click="copyLink"
                  class="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  title="复制链接"
                >
                  <Icon name="Link" class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- 相关文章 -->
      <section v-if="relatedNews.length > 0" class="mt-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">相关文章</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article
            v-for="item in relatedNews"
            :key="item.id"
            class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <NuxtLink :to="`/news/${item.id}`" class="block p-6">
              <!-- 分类标签 -->
              <div class="mb-2">
                <span
                  v-if="item.category"
                  class="tag tag-secondary text-xs"
                >
                  {{ item.category.name }}
                </span>
              </div>

              <!-- 标题 -->
              <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {{ item.title }}
              </h3>

              <!-- 摘要 -->
              <p v-if="item.excerpt" class="text-sm text-gray-600 mb-3 line-clamp-2">
                {{ item.excerpt }}
              </p>

              <!-- 元信息 -->
              <div class="flex items-center text-xs text-gray-500">
                <span>{{ formatDate(item.publishedAt) }}</span>
                <span class="mx-2">•</span>
                <span>{{ formatNumber(item.viewCount || 0) }} 次阅读</span>
              </div>
            </NuxtLink>
          </article>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="bg-white border-t border-gray-200 mt-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-sm text-gray-500">
          <p>&copy; 2025 ChinaJoin. All rights reserved.</p>
          <p class="mt-2">
            Powered by
            <NuxtLink to="/admin" class="text-primary-color hover:underline">
              ChinaJoin CMS
            </NuxtLink>
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { marked } from 'marked'

// 设置页面标题
useHead({
  title: computed(() => news.value ? `${news.value.title} - ChinaJoin` : '新闻详情 - ChinaJoin'),
  meta: computed(() => {
    if (!news.value) return []

    return [
      { name: 'description', content: news.value.seoDescription || news.value.excerpt },
      { name: 'keywords', content: news.value.seoKeywords || '新闻,资讯,ChinaJoin' },
      { property: 'og:title', content: news.value.seoTitle || news.value.title },
      { property: 'og:description', content: news.value.seoDescription || news.value.excerpt },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: `https://chinajoin.com/news/${news.value.id}` },
      { property: 'og:image', content: news.value.featuredImage },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: news.value.seoTitle || news.value.title },
      { name: 'twitter:description', content: news.value.seoDescription || news.value.excerpt },
      { name: 'twitter:image', content: news.value.featuredImage }
    ]
  })
})

// 获取路由参数
const route = useRoute()
const id = route.params.id

// 状态
const loading = ref(true)
const error = ref('')
const news = ref(null)
const relatedNews = ref([])

// 获取认证状态（可选，用于显示管理后台链接）
const authStore = useAuthStore?.()

// 计算属性
const renderedContent = computed(() => {
  if (!news.value?.content) return ''

  try {
    return marked(news.value.content)
  } catch (err) {
    console.error('Markdown 解析失败:', err)
    return '<p class="text-red-500">内容格式错误</p>'
  }
})

// 获取新闻详情
const fetchNews = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await $fetch(`/api/news/${id}`)

    if (response.success) {
      news.value = response.data

      // 增加阅读量
      await incrementViewCount()

      // 获取相关文章
      await fetchRelatedNews()
    } else {
      error.value = response.error || '新闻不存在'
    }
  } catch (err) {
    console.error('获取新闻失败:', err)
    error.value = '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 增加阅读量
const incrementViewCount = async () => {
  try {
    await $fetch(`/api/news/${id}/view`, {
      method: 'POST'
    })
  } catch (err) {
    console.error('增加阅读量失败:', err)
  }
}

// 获取相关文章
const fetchRelatedNews = async () => {
  try {
    const response = await $fetch('/api/news', {
      query: {
        limit: 4,
        categoryId: news.value.categoryId,
        exclude: id
      }
    })

    if (response.success) {
      relatedNews.value = response.data.slice(0, 4)
    }
  } catch (err) {
    console.error('获取相关文章失败:', err)
  }
}

// 获取状态样式
const getStatusClass = (status) => {
  switch (status) {
    case 'published':
      return 'tag-success'
    case 'draft':
      return 'tag-secondary'
    case 'scheduled':
      return 'tag-warning'
    case 'archived':
      return 'tag-error'
    default:
      return 'tag-secondary'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'published':
      return '已发布'
    case 'draft':
      return '草稿'
    case 'scheduled':
      return '定时发布'
    case 'archived':
      return '已归档'
    default:
      return '未知'
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化数字
const formatNumber = (num) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

// 分享到微博
const shareToWeibo = () => {
  const url = window.location.href
  const title = news.value?.title
  const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  window.open(shareUrl, '_blank', 'width=600,height=400')
}

// 分享到微信（显示二维码提示）
const shareToWechat = () => {
  // 简化版实现，实际项目中可以集成微信分享SDK或显示二维码
  alert('请使用微信扫一扫功能分享此页面')
}

// 复制链接
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    alert('链接已复制到剪贴板')
  } catch (err) {
    console.error('复制链接失败:', err)
    alert('复制失败，请手动复制地址栏链接')
  }
}

// 配置 marked 选项
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false,
  sanitize: false,
  smartLists: true,
  smartypants: true,
  xhtml: false
})

// 页面加载时获取数据
onMounted(() => {
  fetchNews()
})

// 监听路由参数变化
watch(() => route.params.id, () => {
  if (route.params.id !== id) {
    fetchNews()
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prose {
  color: #374151;
  line-height: 1.75;
}

.prose h1 {
  font-size: 2em;
  font-weight: 700;
  margin-top: 2em;
  margin-bottom: 1em;
  line-height: 1.25;
}

.prose h2 {
  font-size: 1.5em;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  line-height: 1.25;
}

.prose h3 {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.5em;
  line-height: 1.25;
}

.prose p {
  margin-bottom: 1em;
}

.prose h1:first-child,
.prose h2:first-child,
.prose h3:first-child {
  margin-top: 0;
}

.prose ul, .prose ol {
  margin-bottom: 1em;
  padding-left: 2em;
}

.prose li {
  margin-bottom: 0.5em;
}

.prose blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1em;
  margin: 1em 0;
  font-style: italic;
  color: #6b7280;
  background-color: #f9fafb;
  padding: 1em;
  border-radius: 0.5rem;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125em 0.25em;
  border-radius: 0.25rem;
  font-size: 0.875em;
  color: #dc2626;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1em;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1em;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875em;
}

.prose pre code {
  background-color: transparent;
  color: inherit;
  padding: 0;
}

.prose img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin-bottom: 1em;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.prose a {
  color: #18a058;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.prose a:hover {
  color: #16a34a;
  border-bottom-color: #16a34a;
}

.prose strong {
  font-weight: 600;
  color: #111827;
}

.prose em {
  font-style: italic;
}

.prose hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 2em 0;
}

.prose table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
  font-size: 0.875em;
}

.prose th,
.prose td {
  border: 1px solid #e5e7eb;
  padding: 0.5em 1em;
  text-align: left;
}

.prose th {
  background-color: #f9fafb;
  font-weight: 600;
}

.prose tbody tr:nth-child(even) {
  background-color: #f9fafb;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .prose h1 {
    font-size: 1.5em;
  }

  .prose h2 {
    font-size: 1.25em;
  }

  .prose h3 {
    font-size: 1.125em;
  }
}
</style>