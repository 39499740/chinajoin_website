<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content max-w-6xl" @click.stop>
      <!-- 模态框头部 -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">媒体预览</h2>
        <div class="flex items-center space-x-2">
          <button
            @click="downloadMedia"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            title="下载"
          >
            <Icon name="Download" class="w-5 h-5" />
          </button>
          <button
            @click="copyUrl"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            title="复制链接"
          >
            <Icon name="Copy" class="w-5 h-5" />
          </button>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="X" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 预览区域 -->
        <div class="lg:col-span-2">
          <div class="bg-gray-100 rounded-lg overflow-hidden">
            <!-- 图片预览 -->
            <div v-if="media.type === 'image'" class="relative">
              <img
                :src="media.url"
                :alt="media.name"
                class="w-full h-auto max-h-96 object-contain"
              />
              <!-- 图片工具栏 -->
              <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                <div class="flex items-center justify-between">
                  <div class="text-sm">
                    {{ getImageDimensions() }}
                  </div>
                  <div class="flex items-center space-x-2">
                    <button
                      @click="zoomIn"
                      class="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                      title="放大"
                    >
                      <Icon name="ZoomIn" class="w-4 h-4" />
                    </button>
                    <button
                      @click="zoomOut"
                      class="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                      title="缩小"
                    >
                      <Icon name="ZoomOut" class="w-4 h-4" />
                    </button>
                    <button
                      @click="resetZoom"
                      class="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                      title="重置"
                    >
                      <Icon name="Maximize2" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 视频预览 -->
            <div v-else-if="media.type === 'video'" class="aspect-video">
              <video
                :src="media.url"
                controls
                class="w-full h-full"
                preload="metadata"
              >
                您的浏览器不支持视频播放
              </video>
            </div>

            <!-- 音频预览 -->
            <div v-else-if="media.type === 'audio'" class="p-8">
              <div class="text-center">
                <Icon name="Music" class="w-24 h-24 text-gray-400 mx-auto mb-4" />
                <audio
                  :src="media.url"
                  controls
                  class="w-full max-w-md mx-auto"
                >
                  您的浏览器不支持音频播放
                </audio>
              </div>
            </div>

            <!-- 文档预览 -->
            <div v-else-if="media.type === 'document'" class="p-8">
              <div class="text-center">
                <Icon name="FileText" class="w-24 h-24 text-gray-400 mx-auto mb-4" />
                <p class="text-gray-600 mb-4">文档文件无法直接预览</p>
                <button
                  @click="downloadMedia"
                  class="btn btn-primary"
                >
                  <Icon name="Download" class="w-4 h-4 mr-2" />
                  下载文件
                </button>
              </div>
            </div>

            <!-- 其他文件预览 -->
            <div v-else class="p-8">
              <div class="text-center">
                <Icon name="File" class="w-24 h-24 text-gray-400 mx-auto mb-4" />
                <p class="text-gray-600 mb-4">此文件类型无法预览</p>
                <button
                  @click="downloadMedia"
                  class="btn btn-primary"
                >
                  <Icon name="Download" class="w-4 h-4 mr-2" />
                  下载文件
                </button>
              </div>
            </div>
          </div>

          <!-- 文件信息 -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-sm font-medium text-gray-900 mb-3">文件信息</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">文件名：</span>
                <span class="font-medium text-gray-900">{{ media.name }}</span>
              </div>
              <div>
                <span class="text-gray-500">文件大小：</span>
                <span class="font-medium text-gray-900">{{ formatFileSize(media.size) }}</span>
              </div>
              <div>
                <span class="text-gray-500">文件类型：</span>
                <span class="font-medium text-gray-900">{{ media.mimeType }}</span>
              </div>
              <div>
                <span class="text-gray-500">上传时间：</span>
                <span class="font-medium text-gray-900">{{ formatDate(media.createdAt) }}</span>
              </div>
              <div v-if="media.dimensions">
                <span class="text-gray-500">图片尺寸：</span>
                <span class="font-medium text-gray-900">{{ media.dimensions.width }} × {{ media.dimensions.height }}</span>
              </div>
              <div v-if="media.duration">
                <span class="text-gray-500">时长：</span>
                <span class="font-medium text-gray-900">{{ formatDuration(media.duration) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 侧边栏 -->
        <div class="space-y-6">
          <!-- 快速操作 -->
          <div class="card">
            <h3 class="text-sm font-medium text-gray-900 mb-4">快速操作</h3>
            <div class="space-y-2">
              <button
                @click="downloadMedia"
                class="w-full btn btn-outline justify-start"
              >
                <Icon name="Download" class="w-4 h-4 mr-2" />
                下载文件
              </button>
              <button
                @click="copyUrl"
                class="w-full btn btn-outline justify-start"
              >
                <Icon name="Copy" class="w-4 h-4 mr-2" />
                复制链接
              </button>
              <button
                v-if="media.type === 'image'"
                @click="copyImageUrl"
                class="w-full btn btn-outline justify-start"
              >
                <Icon name="Image" class="w-4 h-4 mr-2" />
                复制图片标签
              </button>
              <button
                @click="$emit('edit', media)"
                class="w-full btn btn-outline justify-start"
              >
                <Icon name="Edit" class="w-4 h-4 mr-2" />
                编辑信息
              </button>
            </div>
          </div>

          <!-- 使用建议 -->
          <div v-if="media.type === 'image'" class="card">
            <h3 class="text-sm font-medium text-gray-900 mb-4">使用建议</h3>
            <div class="space-y-3 text-sm">
              <div class="p-3 bg-blue-50 rounded-lg">
                <p class="font-medium text-blue-900 mb-1">网站横幅</p>
                <p class="text-blue-700">建议尺寸：1920×400px</p>
              </div>
              <div class="p-3 bg-green-50 rounded-lg">
                <p class="font-medium text-green-900 mb-1">文章配图</p>
                <p class="text-green-700">建议尺寸：1200×630px</p>
              </div>
              <div class="p-3 bg-purple-50 rounded-lg">
                <p class="font-medium text-purple-900 mb-1">缩略图</p>
                <p class="text-purple-700">建议尺寸：300×300px</p>
              </div>
            </div>
          </div>

          <!-- 分享选项 -->
          <div class="card">
            <h3 class="text-sm font-medium text-gray-900 mb-4">分享选项</h3>
            <div class="space-y-3">
              <div>
                <label class="form-label">直接链接</label>
                <div class="flex">
                  <input
                    :value="media.url"
                    type="text"
                    readonly
                    class="form-input rounded-r-none"
                  />
                  <button
                    @click="copyToClipboard(media.url)"
                    class="btn btn-secondary rounded-l-none"
                  >
                    复制
                  </button>
                </div>
              </div>
              <div v-if="media.type === 'image'">
                <label class="form-label">HTML 标签</label>
                <div class="flex">
                  <input
                    :value="`<img src=\"${media.url}\" alt=\"${media.name}\" />`"
                    type="text"
                    readonly
                    class="form-input rounded-r-none text-xs"
                  />
                  <button
                    @click="copyToClipboard(`<img src=\"${media.url}\" alt=\"${media.name}\" />`)"
                    class="btn btn-secondary rounded-l-none"
                  >
                    复制
                  </button>
                </div>
              </div>
              <div v-if="media.type === 'image'">
                <label class="form-label">Markdown</label>
                <div class="flex">
                  <input
                    :value="`![${media.name}](${media.url})`"
                    type="text"
                    readonly
                    class="form-input rounded-r-none text-xs"
                  />
                  <button
                    @click="copyToClipboard(`![${media.name}](${media.url})`)"
                    class="btn btn-secondary rounded-l-none"
                  >
                    复制
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 相关文件 -->
          <div class="card">
            <h3 class="text-sm font-medium text-gray-900 mb-4">文件路径</h3>
            <div class="space-y-2">
              <div class="p-3 bg-gray-50 rounded-lg">
                <p class="text-xs text-gray-600 break-all">{{ media.url }}</p>
              </div>
              <p class="text-xs text-gray-500">
                相对路径：{{ media.path || media.url.replace(window.location.origin, '') }}
              </p>
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
          @click="downloadMedia"
          class="btn btn-primary"
        >
          <Icon name="Download" class="w-4 h-4 mr-2" />
          下载文件
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  media: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'edit'])

// 状态
const zoomLevel = ref(1)

// 图片缩放功能
const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 5)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.1)
}

const resetZoom = () => {
  zoomLevel.value = 1
}

const getImageDimensions = () => {
  if (props.media.dimensions) {
    return `${props.media.dimensions.width} × ${props.media.dimensions.height} px`
  }
  return '尺寸信息加载中...'
}

// 文件操作
const downloadMedia = () => {
  const link = document.createElement('a')
  link.href = props.media.url
  link.download = props.media.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const copyUrl = async () => {
  await copyToClipboard(props.media.url)
}

const copyImageUrl = async () => {
  const htmlTag = `<img src="${props.media.url}" alt="${props.media.name}" />`
  await copyToClipboard(htmlTag)
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // 可以添加提示信息
  } catch (error) {
    console.error('复制失败:', error)
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

// 工具函数
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

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

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 键盘快捷键
onMounted(() => {
  const handleKeyDown = (e) => {
    // Escape 关闭
    if (e.key === 'Escape') {
      emit('close')
    }
    // Ctrl/Cmd + S 下载
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      downloadMedia()
    }
    // Ctrl/Cmd + C 复制链接
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !window.getSelection().toString()) {
      e.preventDefault()
      copyUrl()
    }
  }

  document.addEventListener('keydown', handleKeyDown)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
})
</script>

<style scoped>
.modal-content {
  max-height: 90vh;
  overflow-y: auto;
}
</style>