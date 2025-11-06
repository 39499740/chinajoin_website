<template>
  <div>
    <!-- 页面头部 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">媒体管理</h1>
        <p class="text-gray-600 mt-1">管理网站媒体文件，支持图片、视频、文档等多种格式</p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="showUploadModal = true"
          class="btn btn-primary"
        >
          <Icon name="Upload" class="w-4 h-4 mr-2" />
          上传文件
        </button>
        <button
          @click="refreshMedia"
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
              placeholder="搜索文件名或类型..."
              class="form-input pl-10"
              @input="debounceSearch"
            />
          </div>
        </div>

        <!-- 文件类型筛选 -->
        <div class="min-w-[150px]">
          <select
            v-model="typeFilter"
            class="form-select"
            @change="refreshMedia"
          >
            <option value="">全部类型</option>
            <option value="image">图片</option>
            <option value="video">视频</option>
            <option value="document">文档</option>
            <option value="audio">音频</option>
            <option value="other">其他</option>
          </select>
        </div>

        <!-- 日期筛选 -->
        <div class="min-w-[150px]">
          <select
            v-model="dateFilter"
            class="form-select"
            @change="refreshMedia"
          >
            <option value="">全部时间</option>
            <option value="today">今天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="year">今年</option>
          </select>
        </div>

        <!-- 排序方式 -->
        <div class="min-w-[120px]">
          <select
            v-model="sortBy"
            class="form-select"
            @change="refreshMedia"
          >
            <option value="createdAt-desc">最新上传</option>
            <option value="createdAt-asc">最早上传</option>
            <option value="name-asc">名称 A-Z</option>
            <option value="name-desc">名称 Z-A</option>
            <option value="size-desc">文件大小</option>
          </select>
        </div>

        <!-- 视图切换 -->
        <div class="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            @click="viewMode = 'grid'"
            :class="viewMode === 'grid' ? 'bg-white shadow-sm' : ''"
            class="p-2 rounded hover:bg-gray-200 transition-colors"
            title="网格视图"
          >
            <Icon name="Grid" class="w-4 h-4" />
          </button>
          <button
            @click="viewMode = 'list'"
            :class="viewMode === 'list' ? 'bg-white shadow-sm' : ''"
            class="p-2 rounded hover:bg-gray-200 transition-colors"
            title="列表视图"
          >
            <Icon name="List" class="w-4 h-4" />
          </button>
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
            <p class="text-sm font-medium text-gray-600">总文件数</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.total || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-green-100 rounded-lg p-3">
            <Icon name="Image" class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">图片文件</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.images || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-purple-100 rounded-lg p-3">
            <Icon name="Video" class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">视频文件</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.videos || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
            <Icon name="HardDrive" class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总大小</p>
            <p class="text-2xl font-semibold text-gray-900">{{ formatFileSize(stats.totalSize || 0) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 媒体文件列表 -->
    <div class="card">
      <!-- 批量操作栏 -->
      <div v-if="selectedItems.length > 0" class="border-b border-gray-200 p-4 bg-gray-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">
              已选择 {{ selectedItems.length }} 个文件
            </span>
            <button
              @click="selectAll"
              class="text-sm text-primary-color hover:text-primary-hover"
            >
              全选当前页
            </button>
            <button
              @click="clearSelection"
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              清除选择
            </button>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="batchDownload"
              class="btn btn-sm btn-outline"
            >
              <Icon name="Download" class="w-4 h-4 mr-1" />
              批量下载
            </button>
            <button
              @click="batchDelete"
              class="btn btn-sm btn-danger"
            >
              <Icon name="Trash2" class="w-4 h-4 mr-1" />
              批量删除
            </button>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="loading-spinner w-8 h-8"></div>
        <span class="ml-3 text-gray-600">加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="mediaList.length === 0" class="text-center py-12">
        <Icon name="Inbox" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">暂无媒体文件</h3>
        <p class="text-gray-600 mb-4">点击"上传文件"按钮添加第一个媒体文件</p>
        <button
          @click="showUploadModal = true"
          class="btn btn-primary"
        >
          <Icon name="Upload" class="w-4 h-4 mr-2" />
          上传文件
        </button>
      </div>

      <!-- 网格视图 -->
      <div v-else-if="viewMode === 'grid'" class="p-4">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div
            v-for="media in mediaList"
            :key="media.id"
            class="relative group cursor-pointer"
            @click="selectMedia(media)"
          >
            <!-- 选择框 -->
            <div class="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                :checked="selectedItems.includes(media.id)"
                @change.stop="toggleSelect(media.id)"
                class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
              />
            </div>

            <!-- 文件预览 -->
            <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-primary-color transition-colors">
              <img
                v-if="media.type === 'image'"
                :src="media.url"
                :alt="media.name"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center"
              >
                <Icon
                  :name="getFileIcon(media.type)"
                  class="w-12 h-12 text-gray-400"
                />
              </div>
            </div>

            <!-- 文件信息 -->
            <div class="mt-2">
              <p class="text-sm font-medium text-gray-900 truncate" :title="media.name">
                {{ media.name }}
              </p>
              <p class="text-xs text-gray-500">
                {{ formatFileSize(media.size) }} • {{ formatDate(media.createdAt) }}
              </p>
            </div>

            <!-- 悬停操作按钮 -->
            <div class="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <button
                @click.stop="previewMedia(media)"
                class="p-2 bg-white rounded-full text-gray-700 hover:text-primary-color"
                title="预览"
              >
                <Icon name="Eye" class="w-4 h-4" />
              </button>
              <button
                @click.stop="editMedia(media)"
                class="p-2 bg-white rounded-full text-gray-700 hover:text-primary-color"
                title="编辑"
              >
                <Icon name="Edit" class="w-4 h-4" />
              </button>
              <button
                @click.stop="downloadMedia(media)"
                class="p-2 bg-white rounded-full text-gray-700 hover:text-primary-color"
                title="下载"
              >
                <Icon name="Download" class="w-4 h-4" />
              </button>
              <button
                @click.stop="deleteMedia(media)"
                class="p-2 bg-white rounded-full text-red-600 hover:text-red-800"
                title="删除"
              >
                <Icon name="Trash2" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th class="w-12">
                <input
                  type="checkbox"
                  v-model="selectAllChecked"
                  @change="toggleSelectAll"
                  class="rounded border-gray-300"
                />
              </th>
              <th>文件名</th>
              <th>类型</th>
              <th>大小</th>
              <th>上传时间</th>
              <th>上传者</th>
              <th class="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="media in mediaList"
              :key="media.id"
              class="hover:bg-gray-50"
            >
              <td>
                <input
                  type="checkbox"
                  :checked="selectedItems.includes(media.id)"
                  @change="toggleSelect(media.id)"
                  class="rounded border-gray-300"
                />
              </td>
              <td>
                <div class="flex items-center">
                  <div class="flex-shrink-0 mr-3">
                    <img
                      v-if="media.type === 'image'"
                      :src="media.url"
                      :alt="media.name"
                      class="w-10 h-10 object-cover rounded"
                    />
                    <Icon
                      v-else
                      :name="getFileIcon(media.type)"
                      class="w-10 h-10 text-gray-400"
                    />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ media.name }}</p>
                    <p class="text-sm text-gray-500">{{ media.mimeType }}</p>
                  </div>
                </div>
              </td>
              <td>
                <span
                  :class="getTypeClass(media.type)"
                  class="tag"
                >
                  {{ getTypeText(media.type) }}
                </span>
              </td>
              <td>
                <span class="text-sm text-gray-700">
                  {{ formatFileSize(media.size) }}
                </span>
              </td>
              <td>
                <span class="text-sm text-gray-700">
                  {{ formatDate(media.createdAt) }}
                </span>
              </td>
              <td>
                <div class="flex items-center">
                  <div class="w-6 h-6 bg-gray-200 rounded-full mr-2 flex items-center justify-center">
                    <span class="text-xs font-medium text-gray-600">
                      {{ media.uploadedBy?.username?.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <span class="text-sm text-gray-700">
                    {{ media.uploadedBy?.username }}
                  </span>
                </div>
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="previewMedia(media)"
                    class="text-blue-600 hover:text-blue-800"
                    title="预览"
                  >
                    <Icon name="Eye" class="w-4 h-4" />
                  </button>
                  <button
                    @click="editMedia(media)"
                    class="text-indigo-600 hover:text-indigo-800"
                    title="编辑"
                  >
                    <Icon name="Edit" class="w-4 h-4" />
                  </button>
                  <button
                    @click="downloadMedia(media)"
                    class="text-green-600 hover:text-green-800"
                    title="下载"
                  >
                    <Icon name="Download" class="w-4 h-4" />
                  </button>
                  <button
                    @click="copyUrl(media)"
                    class="text-purple-600 hover:text-purple-800"
                    title="复制链接"
                  >
                    <Icon name="Copy" class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteMedia(media)"
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

    <!-- 上传模态框 -->
    <MediaUpload
      v-if="showUploadModal"
      @close="showUploadModal = false"
      @uploaded="handleUploaded"
    />

    <!-- 预览模态框 -->
    <MediaPreview
      v-if="showPreviewModal"
      :media="previewMediaItem"
      @close="showPreviewModal = false"
    />

    <!-- 编辑模态框 -->
    <MediaEdit
      v-if="showEditModal"
      :media="editingMedia"
      @close="showEditModal = false"
      @updated="handleUpdated"
    />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

// 设置页面标题
useHead({
  title: '媒体管理 - ChinaJoin CMS'
})

// 使用中间件
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()

// 状态
const loading = ref(false)
const mediaList = ref([])
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  from: 0,
  to: 0,
  totalPages: 0
})

const stats = ref({
  total: 0,
  images: 0,
  videos: 0,
  documents: 0,
  totalSize: 0
})

const searchQuery = ref('')
const typeFilter = ref('')
const dateFilter = ref('')
const sortBy = ref('createdAt-desc')
const viewMode = ref('grid')
const selectedItems = ref([])

// 模态框状态
const showUploadModal = ref(false)
const showPreviewModal = ref(false)
const showEditModal = ref(false)
const previewMediaItem = ref(null)
const editingMedia = ref(null)

// 计算属性
const selectAllChecked = computed({
  get: () => mediaList.value.length > 0 && selectedItems.value.length === mediaList.value.length,
  set: (value) => {
    if (value) {
      selectedItems.value = mediaList.value.map(item => item.id)
    } else {
      selectedItems.value = []
    }
  }
})

// 获取媒体文件列表
const fetchMedia = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/media', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value,
        type: typeFilter.value,
        date: dateFilter.value,
        sort: sortBy.value
      }
    })

    if (response.success) {
      mediaList.value = response.data
      pagination.value = response.pagination
    }
  } catch (error) {
    console.error('获取媒体列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await $fetch('/api/admin/media/stats')
    if (response.success) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 搜索防抖
const debounceSearch = useDebounceFn(() => {
  pagination.value.page = 1
  fetchMedia()
}, 300)

// 分页操作
const changePage = (page) => {
  pagination.value.page = page
  fetchMedia()
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
  selectAllChecked.value = !selectAllChecked.value
}

const selectAll = () => {
  selectedItems.value = mediaList.value.map(item => item.id)
}

const clearSelection = () => {
  selectedItems.value = []
}

// 媒体操作
const previewMedia = (media) => {
  previewMediaItem.value = media
  showPreviewModal.value = true
}

const editMedia = (media) => {
  editingMedia.value = media
  showEditModal.value = true
}

const downloadMedia = (media) => {
  const link = document.createElement('a')
  link.href = media.url
  link.download = media.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const copyUrl = async (media) => {
  try {
    await navigator.clipboard.writeText(media.url)
    // 可以添加提示信息
  } catch (error) {
    console.error('复制链接失败:', error)
  }
}

const deleteMedia = async (media) => {
  if (!confirm(`确定要删除文件"${media.name}"吗？此操作不可撤销。`)) {
    return
  }

  try {
    const response = await $fetch(`/api/admin/media/${media.id}`, {
      method: 'DELETE'
    })

    if (response.success) {
      await fetchMedia()
      await fetchStats()
      // 从选择列表中移除
      const index = selectedItems.value.indexOf(media.id)
      if (index > -1) {
        selectedItems.value.splice(index, 1)
      }
    } else {
      alert(response.error || '删除失败')
    }
  } catch (error) {
    console.error('删除媒体失败:', error)
    alert('删除失败，请稍后重试')
  }
}

// 批量操作
const batchDownload = async () => {
  const selectedMedia = mediaList.value.filter(item => selectedItems.value.includes(item.id))

  for (const media of selectedMedia) {
    setTimeout(() => {
      downloadMedia(media)
    }, selectedMedia.indexOf(media) * 100) // 间隔100ms下载
  }
}

const batchDelete = async () => {
  if (!confirm(`确定要删除选中的 ${selectedItems.value.length} 个文件吗？此操作不可撤销。`)) {
    return
  }

  try {
    const response = await $fetch('/api/admin/media/batch', {
      method: 'DELETE',
      body: { ids: selectedItems.value }
    })

    if (response.success) {
      await fetchMedia()
      await fetchStats()
      selectedItems.value = []
    } else {
      alert(response.error || '批量删除失败')
    }
  } catch (error) {
    console.error('批量删除失败:', error)
    alert('批量删除失败，请稍后重试')
  }
}

// 模态框处理
const handleUploaded = () => {
  showUploadModal.value = false
  fetchMedia()
  fetchStats()
}

const handleUpdated = () => {
  showEditModal.value = false
  fetchMedia()
}

const selectMedia = (media) => {
  if (event.ctrlKey || event.metaKey) {
    toggleSelect(media.id)
  } else {
    // 单击时可以预览或执行其他操作
    previewMedia(media)
  }
}

// 刷新
const refreshMedia = async () => {
  pagination.value.page = 1
  selectedItems.value = []
  await Promise.all([
    fetchMedia(),
    fetchStats()
  ])
}

// 工具函数
const getFileIcon = (type) => {
  switch (type) {
    case 'image':
      return 'Image'
    case 'video':
      return 'Video'
    case 'audio':
      return 'Music'
    case 'document':
      return 'FileText'
    default:
      return 'File'
  }
}

const getTypeClass = (type) => {
  switch (type) {
    case 'image':
      return 'tag-success'
    case 'video':
      return 'tag-warning'
    case 'audio':
      return 'tag-primary'
    case 'document':
      return 'tag-secondary'
    default:
      return 'tag-secondary'
  }
}

const getTypeText = (type) => {
  switch (type) {
    case 'image':
      return '图片'
    case 'video':
      return '视频'
    case 'audio':
      return '音频'
    case 'document':
      return '文档'
    default:
      return '其他'
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 页面加载时获取数据
onMounted(async () => {
  await Promise.all([
    fetchMedia(),
    fetchStats()
  ])
})

// 键盘快捷键
onMounted(() => {
  const handleKeyDown = (e) => {
    // Ctrl/Cmd + A 全选
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault()
      selectAll()
    }
    // Delete 删除选中项
    if (e.key === 'Delete' && selectedItems.value.length > 0) {
      batchDelete()
    }
    // Esc 清除选择
    if (e.key === 'Escape') {
      clearSelection()
    }
  }

  document.addEventListener('keydown', handleKeyDown)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
})
</script>