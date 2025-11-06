<template>
  <div>
    <!-- 页面头部 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">新闻管理</h1>
        <p class="text-gray-600 mt-1">管理网站新闻内容，支持富文本编辑和实时预览</p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="showCreateModal = true"
          class="btn btn-primary"
        >
          <Icon name="Plus" class="w-4 h-4 mr-2" />
          新建新闻
        </button>
        <button
          @click="refreshNews"
          :disabled="loading"
          class="btn btn-secondary"
        >
          <Icon name="RefreshCw" class="w-4 h-4 mr-2" />
          刷新
        </button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="card mb-6">
      <div class="flex flex-wrap items-center gap-4 p-4">
        <!-- 搜索 -->
        <div class="flex-1 min-w-[200px]">
          <div class="relative">
            <Icon name="Search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索新闻标题或内容..."
              class="form-input pl-10"
              @input="debounceSearch"
            />
          </div>
        </div>

        <!-- 状态筛选 -->
        <div class="min-w-[120px]">
          <select
            v-model="statusFilter"
            class="form-select"
            @change="refreshNews"
          >
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="archived">已归档</option>
          </select>
        </div>

        <!-- 分类筛选 -->
        <div class="min-w-[150px]">
          <select
            v-model="categoryFilter"
            class="form-select"
            @change="refreshNews"
          >
            <option value="">全部分类</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- 每页显示数量 -->
        <div class="min-w-[100px]">
          <select
            v-model="pageSize"
            class="form-select"
            @change="refreshNews"
          >
            <option :value="10">10条/页</option>
            <option :value="20">20条/页</option>
            <option :value="50">50条/页</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-blue-100 rounded-lg p-3">
            <Icon name="FileText" class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">新闻总数</p>
            <p class="text-2xl font-semibold text-gray-900">{{ pagination.total || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-green-100 rounded-lg p-3">
            <Icon name="CheckCircle" class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">已发布</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.published || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-gray-100 rounded-lg p-3">
            <Icon name="Edit" class="w-6 h-6 text-gray-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">草稿</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.draft || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
            <Icon name="Archive" class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">已归档</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.archived || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 新闻列表 -->
    <div class="card">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="loading-spinner w-8 h-8"></div>
        <span class="ml-3 text-gray-600">加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="newsList.length === 0" class="text-center py-12">
        <Icon name="Inbox" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">暂无新闻</h3>
        <p class="text-gray-600">点击"新建新闻"按钮创建第一篇新闻</p>
      </div>

      <!-- 新闻表格 -->
      <div v-else class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th class="w-12">
                <input
                  type="checkbox"
                  v-model="selectAll"
                  @change="toggleSelectAll"
                  class="rounded border-gray-300"
                />
              </th>
              <th>标题</th>
              <th>分类</th>
              <th>状态</th>
              <th>作者</th>
              <th>发布时间</th>
              <th>阅读量</th>
              <th class="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="news in newsList"
              :key="news.id"
              class="hover:bg-gray-50"
            >
              <td>
                <input
                  type="checkbox"
                  :checked="selectedItems.includes(news.id)"
                  @change="toggleSelect(news.id)"
                  class="rounded border-gray-300"
                />
              </td>
              <td>
                <div class="max-w-xs">
                  <div class="font-medium text-gray-900 truncate">
                    {{ news.title }}
                  </div>
                  <div class="text-sm text-gray-500 truncate">
                    {{ news.excerpt }}
                  </div>
                </div>
              </td>
              <td>
                <span
                  v-if="news.category"
                  class="tag tag-secondary"
                >
                  {{ news.category.name }}
                </span>
              </td>
              <td>
                <span
                  :class="getStatusClass(news.status)"
                  class="tag"
                >
                  {{ getStatusText(news.status) }}
                </span>
              </td>
              <td>
                <div class="flex items-center">
                  <div class="w-6 h-6 bg-gray-200 rounded-full mr-2 flex items-center justify-center">
                    <span class="text-xs font-medium text-gray-600">
                      {{ news.author?.username?.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <span class="text-sm text-gray-700">
                    {{ news.author?.username }}
                  </span>
                </div>
              </td>
              <td>
                <span class="text-sm text-gray-700">
                  {{ formatDate(news.publishedAt) }}
                </span>
              </td>
              <td>
                <span class="text-sm text-gray-700">
                  {{ news.viewCount || 0 }}
                </span>
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="openPreviewModal(news)"
                    class="text-blue-600 hover:text-blue-800"
                    title="预览"
                  >
                    <Icon name="Eye" class="w-4 h-4" />
                  </button>
                  <button
                    @click="editNews(news)"
                    class="text-indigo-600 hover:text-indigo-800"
                    title="编辑"
                  >
                    <Icon name="Edit" class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteNews(news)"
                    class="text-red-600 hover:text-red-800"
                    title="删除"
                  >
                    <Icon name="Trash2" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <div class="pagination-info">
          显示第 {{ pagination.from }} - {{ pagination.to }} 条，共 {{ pagination.total }} 条记录
        </div>
        <div class="pagination-controls">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="btn btn-outline btn-sm"
          >
            上一页
          </button>
          <button
            v-for="page in pagination.pages"
            :key="page"
            @click="changePage(page)"
            :class="[
              page === pagination.page
                ? 'btn-primary'
                : 'btn-outline btn-sm'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages"
            class="btn btn-outline btn-sm"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑新闻弹窗 -->
    <NewsModal
      v-if="showCreateModal || showEditModal"
      :news="editingNews"
      :categories="categories"
      @save="handleSaveNews"
      @cancel="handleCancelModal"
    />

    <!-- 预览弹窗 -->
    <NewsPreview
      v-if="showPreviewModal"
      :news="previewNewsItem"
      @close="showPreviewModal = false"
    />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

// 设置页面标题
useHead({
  title: '新闻管理 - ChinaJoin CMS'
})

// 使用中间件
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()

// 状态
const loading = ref(false)
const newsList = ref([])
const categories = ref([])
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  from: 0,
  to: 0,
  totalPages: 0
})

const stats = ref({
  published: 0,
  draft: 0,
  archived: 0
})

const searchQuery = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const pageSize = ref(10)

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showPreviewModal = ref(false)
const editingNews = ref(null)
const previewNewsItem = ref(null)
const selectedItems = ref([])

// 计算属性
const selectAll = computed({
  get: () => newsList.value.length > 0 && selectedItems.value.length === newsList.value.length,
  set: (value) => {
    if (value) {
      selectedItems.value = newsList.value.map(item => item.id)
    } else {
      selectedItems.value = []
    }
  }
})

// 获取新闻列表
const fetchNews = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/news', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value,
        status: statusFilter.value,
        categoryId: categoryFilter.value
      }
    })

    if (response.success) {
      newsList.value = response.data
      pagination.value = response.pagination
    }
  } catch (error) {
    console.error('获取新闻列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await $fetch('/api/admin/categories')
    if (response.success) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await $fetch('/api/admin/stats')
    if (response.success) {
      const totalNews = response.data.newsCount
      stats.value = {
        published: 0, // 这里需要从后端获取实际数据
        draft: 0,
        archived: 0
      }
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 搜索防抖
const debounceSearch = useDebounceFn(() => {
  pagination.value.page = 1
  fetchNews()
}, 300)

// 分页操作
const changePage = (page) => {
  pagination.value.page = page
  fetchNews()
}

// 选择操作
const toggleSelect = (id) => {
  const index = selectedItems.value.indexOf(id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(id)
  }
}

const toggleSelectAll = () => {
  selectAll.value = !selectAll.value
}

// 新闻操作
const editNews = (news) => {
  editingNews.value = news
  showEditModal.value = true
}

const openPreviewModal = (news) => {
  previewNewsItem.value = news
  showPreviewModal.value = true
}

const deleteNews = async (news) => {
  if (!confirm(`确定要删除新闻"${news.title}"吗？此操作不可撤销。`)) {
    return
  }

  try {
    const response = await $fetch(`/api/admin/news/${news.id}`, {
      method: 'DELETE'
    })

    if (response.success) {
      await fetchNews()
      alert('新闻删除成功')
    } else {
      alert(response.error || '删除失败')
    }
  } catch (error) {
    console.error('删除新闻失败:', error)
    alert('删除失败，请稍后重试')
  }
}

// 保存新闻
const handleSaveNews = async (newsData) => {
  try {
    let response

    if (editingNews.value) {
      // 更新新闻
      response = await $fetch(`/api/admin/news/${editingNews.value.id}`, {
        method: 'PUT',
        body: newsData
      })
    } else {
      // 创建新闻
      response = await $fetch('/api/admin/news', {
        method: 'POST',
        body: newsData
      })
    }

    if (response.success) {
      await fetchNews()
      await fetchStats()
      handleCancelModal()
      alert(editingNews.value ? '新闻更新成功' : '新闻创建成功')
    } else {
      alert(response.error || '操作失败')
    }
  } catch (error) {
    console.error('保存新闻失败:', error)
    alert('操作失败，请稍后重试')
  }
}

// 取消弹窗
const handleCancelModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingNews.value = null
}

// 刷新
const refreshNews = async () => {
  pagination.value.page = 1
  selectedItems.value = []
  await Promise.all([
    fetchNews(),
    fetchCategories(),
    fetchStats()
  ])
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 获取状态样式
const getStatusClass = (status) => {
  switch (status) {
    case 'published':
      return 'tag-success'
    case 'draft':
      return 'tag-secondary'
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
    case 'archived':
      return '已归档'
    default:
      return '未知'
  }
}

// 页面加载时获取数据
onMounted(async () => {
  await Promise.all([
    fetchNews(),
    fetchCategories(),
    fetchStats()
  ])
})
</script>