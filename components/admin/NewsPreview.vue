<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content max-w-4xl" @click.stop>
      <!-- 模态框头部 -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">新闻预览</h2>
        <div class="flex items-center space-x-2">
          <button
            @click="openInNewTab"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            title="在新标签页中打开"
          >
            <Icon name="ExternalLink" class="w-5 h-5" />
          </button>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="X" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- 预览内容 -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <!-- 文章头部 -->
        <div class="p-6 border-b border-gray-200">
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
          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            {{ news.title }}
          </h1>

          <!-- 元信息 -->
          <div class="flex items-center text-sm text-gray-500 space-x-4">
            <div class="flex items-center">
              <div class="w-6 h-6 bg-gray-200 rounded-full mr-2 flex items-center justify-center">
                <span class="text-xs font-medium text-gray-600">
                  {{ news.author?.username?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <span>{{ news.author?.username }}</span>
            </div>
            <span>•</span>
            <span>{{ formatDate(news.publishedAt) }}</span>
            <span>•</span>
            <span>阅读量：{{ news.viewCount || 0 }}</span>
          </div>
        </div>

        <!-- 特色图片 -->
        <div v-if="news.featuredImage" class="aspect-video bg-gray-100">
          <img
            :src="news.featuredImage"
            :alt="news.title"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- 文章内容 -->
        <div class="p-6">
          <!-- 摘要 -->
          <div v-if="news.excerpt" class="text-lg text-gray-600 leading-relaxed mb-6 p-4 bg-gray-50 rounded-lg">
            {{ news.excerpt }}
          </div>

          <!-- 正文内容 -->
          <div
            class="prose prose-lg max-w-none"
            v-html="renderedContent"
          />
        </div>

        <!-- SEO 信息预览 -->
        <div class="border-t border-gray-200 bg-gray-50 p-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">SEO 信息预览</h3>
          <div class="space-y-3 text-sm">
            <div>
              <span class="font-medium text-gray-700">SEO 标题：</span>
              <span class="text-gray-600">{{ news.seoTitle || news.title }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">SEO 描述：</span>
              <span class="text-gray-600">{{ news.seoDescription || news.excerpt }}</span>
            </div>
            <div v-if="news.seoKeywords">
              <span class="font-medium text-gray-700">SEO 关键词：</span>
              <span class="text-gray-600">{{ news.seoKeywords }}</span>
            </div>
          </div>

          <!-- 搜索引擎结果预览 -->
          <div class="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-3">搜索引擎结果预览</h4>
            <div class="space-y-2">
              <div class="text-blue-700 text-lg hover:underline cursor-pointer">
                {{ truncateText(news.seoTitle || news.title, 60) }}
              </div>
              <div class="text-green-700 text-sm">
                localhost:3002/news/{{ news.id }}
              </div>
              <div class="text-gray-600 text-sm">
                {{ truncateText(news.seoDescription || news.excerpt, 160) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="border-t border-gray-200 bg-gray-50 p-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-500">字符数：</span>
              <span class="font-medium text-gray-900">{{ getCharacterCount() }}</span>
            </div>
            <div>
              <span class="text-gray-500">预计阅读时间：</span>
              <span class="font-medium text-gray-900">{{ getReadingTime() }}</span>
            </div>
            <div>
              <span class="text-gray-500">创建时间：</span>
              <span class="font-medium text-gray-900">{{ formatDate(news.createdAt) }}</span>
            </div>
            <div>
              <span class="text-gray-500">最后修改：</span>
              <span class="font-medium text-gray-900">{{ formatDate(news.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center justify-end space-x-3 mt-6 pt-6 border-t">
        <button
          @click="$emit('close')"
          class="btn btn-secondary"
        >
          关闭预览
        </button>
        <button
          @click="openInNewTab"
          class="btn btn-primary"
        >
          <Icon name="ExternalLink" class="w-4 h-4 mr-2" />
          在新标签页中打开
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { marked } from 'marked'

// Props
const props = defineProps({
  news: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['close'])

// 计算属性
const renderedContent = computed(() => {
  try {
    return marked(props.news.content || '')
  } catch (error) {
    console.error('Markdown 解析失败:', error)
    return '<p class="text-red-500">内容格式错误</p>'
  }
})

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
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 截断文本
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 获取字符数
const getCharacterCount = () => {
  const content = props.news.content || ''
  return content.length.toLocaleString('zh-CN')
}

// 获取预计阅读时间（按每分钟300字计算）
const getReadingTime = => {
  const content = props.news.content || ''
  const wordsPerMinute = 300
  const minutes = Math.ceil(content.length / wordsPerMinute)
  return minutes < 1 ? '不到1分钟' : `${minutes}分钟`
}

// 在新标签页中打开
const openInNewTab = () => {
  const url = `/news/${props.news.id}`
  window.open(url, '_blank')
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
</script>

<style scoped>
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

.prose h4 {
  font-size: 1.125em;
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
.prose h3:first-child,
.prose h4:first-child {
  margin-top: 0;
}

.prose ul, .prose ol {
  margin-bottom: 1em;
  padding-left: 2em;
}

.prose li {
  margin-bottom: 0.5em;
}

.prose ul li {
  list-style-type: disc;
}

.prose ol li {
  list-style-type: decimal;
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