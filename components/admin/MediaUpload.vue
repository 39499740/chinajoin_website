<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content max-w-4xl" @click.stop>
      <!-- 模态框头部 -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">上传媒体文件</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="X" class="w-5 h-5" />
        </button>
      </div>

      <!-- 上传区域 -->
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
        :class="{ 'border-primary-color bg-primary-color bg-opacity-5': isDragging }"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @dragenter="handleDragEnter"
      >
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
          class="hidden"
          @change="handleFileSelect"
        />

        <div v-if="files.length === 0" class="space-y-4">
          <Icon name="UploadCloud" class="w-16 h-16 text-gray-400 mx-auto" />
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">拖拽文件到此处上传</h3>
            <p class="text-gray-600 mb-4">或者点击下方按钮选择文件</p>
          </div>
          <button
            @click="$refs.fileInput.click()"
            class="btn btn-primary"
          >
            <Icon name="FolderOpen" class="w-4 h-4 mr-2" />
            选择文件
          </button>
          <div class="text-xs text-gray-500 mt-4">
            <p>支持格式：图片 (JPG, PNG, GIF, WebP)、视频 (MP4, AVI, MOV)</p>
            <p>音频 (MP3, WAV)、文档 (PDF, DOC, XLS, PPT)、压缩包 (ZIP, RAR)</p>
            <p>单个文件最大 50MB，总大小不超过 500MB</p>
          </div>
        </div>

        <!-- 文件列表 -->
        <div v-else class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              已选择 {{ files.length }} 个文件
            </h3>
            <button
              @click="clearFiles"
              class="text-sm text-red-600 hover:text-red-800"
            >
              清空列表
            </button>
          </div>

          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div
              v-for="(file, index) in files"
              :key="index"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center flex-1">
                <div class="flex-shrink-0 mr-3">
                  <Icon
                    :name="getFileIcon(file.type)"
                    class="w-8 h-8 text-gray-400"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ file.name }}
                  </p>
                  <div class="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{{ formatFileSize(file.size) }}</span>
                    <span>{{ file.type }}</span>
                    <span v-if="file.error" class="text-red-500">{{ file.error }}</span>
                  </div>
                </div>
              </div>

              <!-- 上传进度 -->
              <div v-if="file.uploading" class="flex items-center mr-3">
                <div class="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-primary-color h-2 rounded-full transition-all duration-300"
                    :style="{ width: file.progress + '%' }"
                  ></div>
                </div>
                <span class="ml-2 text-xs text-gray-600">{{ file.progress }}%</span>
              </div>

              <!-- 状态图标 -->
              <div class="flex items-center space-x-2">
                <div v-if="file.uploading" class="loading-spinner w-4 h-4"></div>
                <Icon
                  v-else-if="file.success"
                  name="CheckCircle"
                  class="w-5 h-5 text-green-500"
                />
                <Icon
                  v-else-if="file.error"
                  name="XCircle"
                  class="w-5 h-5 text-red-500"
                />
                <button
                  v-else
                  @click="removeFile(index)"
                  class="text-gray-400 hover:text-red-500"
                >
                  <Icon name="X" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- 上传按钮 -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-200">
            <div class="text-sm text-gray-600">
              总大小：{{ formatFileSize(totalSize) }}
            </div>
            <div class="flex items-center space-x-3">
              <button
                @click="$refs.fileInput.click()"
                class="btn btn-outline"
              >
                <Icon name="Plus" class="w-4 h-4 mr-2" />
                添加更多文件
              </button>
              <button
                @click="uploadFiles"
                :disabled="uploading || files.length === 0"
                class="btn btn-primary"
              >
                <span v-if="uploading" class="flex items-center">
                  <div class="loading-spinner w-4 h-4 mr-2"></div>
                  上传中...
                </span>
                <span v-else>
                  <Icon name="Upload" class="w-4 h-4 mr-2" />
                  开始上传
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 上传设置 -->
      <div class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 class="text-sm font-medium text-gray-900 mb-3">上传设置</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-label">文件命名</label>
            <select v-model="namingRule" class="form-select">
              <option value="original">保持原名</option>
              <option value="timestamp">时间戳重命名</option>
              <option value="uuid">UUID重命名</option>
              <option value="custom">自定义命名</option>
            </select>
          </div>
          <div>
            <label class="form-label">图片处理</label>
            <select v-model="imageProcessing" class="form-select">
              <option value="none">不处理</option>
              <option value="resize">调整大小</option>
              <option value="compress">压缩</option>
              <option value="webp">转换为WebP</option>
            </select>
          </div>
        </div>
        <div v-if="imageProcessing !== 'none'" class="mt-3">
          <label class="form-label">最大宽度/高度 (px)</label>
          <input
            v-model.number="maxDimension"
            type="number"
            min="100"
            max="4000"
            class="form-input"
            placeholder="1920"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Emits
const emit = defineEmits(['close', 'uploaded'])

// 状态
const files = ref([])
const uploading = ref(false)
const isDragging = ref(false)
const fileInput = ref(null)

// 上传设置
const namingRule = ref('original')
const imageProcessing = ref('none')
const maxDimension = ref(1920)

// 计算属性
const totalSize = computed(() => {
  return files.value.reduce((sum, file) => sum + file.size, 0)
})

// 文件选择处理
const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files)
  addFiles(selectedFiles)
  event.target.value = '' // 重置input
}

// 拖拽处理
const handleDragEnter = (e) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragOver = (e) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (e) => {
  e.preventDefault()
  isDragging.value = false
}

const handleDrop = (e) => {
  e.preventDefault()
  isDragging.value = false

  const droppedFiles = Array.from(e.dataTransfer.files)
  addFiles(droppedFiles)
}

// 添加文件
const addFiles = (newFiles) => {
  for (const file of newFiles) {
    // 检查文件大小
    if (file.size > 50 * 1024 * 1024) {
      addFileToList(file, '文件大小超过50MB限制')
      continue
    }

    // 检查文件类型
    if (!isValidFileType(file)) {
      addFileToList(file, '不支持的文件类型')
      continue
    }

    // 检查重复文件
    const duplicate = files.value.find(f => f.name === file.name && f.size === file.size)
    if (duplicate) {
      addFileToList(file, '文件已存在')
      continue
    }

    addFileToList(file)
  }
}

const addFileToList = (file, error = null) => {
  const fileObj = {
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    uploading: false,
    progress: 0,
    success: false,
    error
  }

  files.value.push(fileObj)
}

// 文件验证
const isValidFileType = (file) => {
  const allowedTypes = [
    // 图片
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // 视频
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv',
    // 音频
    'audio/mp3', 'audio/wav', 'audio/flac', 'audio/aac',
    // 文档
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    // 压缩包
    'application/zip', 'application/x-rar-compressed'
  ]

  return allowedTypes.includes(file.type)
}

// 移除文件
const removeFile = (index) => {
  files.value.splice(index, 1)
}

const clearFiles = () => {
  files.value = []
}

// 上传文件
const uploadFiles = async () => {
  if (files.value.length === 0) return

  uploading.value = true

  try {
    for (let i = 0; i < files.value.length; i++) {
      const fileObj = files.value[i]
      if (fileObj.error || fileObj.success) continue

      await uploadSingleFile(fileObj, i)
    }

    // 检查是否有成功上传的文件
    const successCount = files.value.filter(f => f.success).length
    if (successCount > 0) {
      emit('uploaded')
    }
  } finally {
    uploading.value = false
  }
}

const uploadSingleFile = async (fileObj, index) => {
  fileObj.uploading = true
  fileObj.progress = 0

  try {
    const formData = new FormData()

    // 处理文件名
    let fileName = fileObj.name
    if (namingRule.value === 'timestamp') {
      const ext = fileName.split('.').pop()
      fileName = `${Date.now()}.${ext}`
    } else if (namingRule.value === 'uuid') {
      const ext = fileName.split('.').pop()
      fileName = `${crypto.randomUUID()}.${ext}`
    }

    formData.append('file', fileObj.file, fileName)
    formData.append('imageProcessing', imageProcessing.value)
    if (maxDimension.value) {
      formData.append('maxDimension', maxDimension.value.toString())
    }

    // 创建 XMLHttpRequest 以支持进度监控
    const response = await $fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
      onRequestError({ error }) {
        throw error
      },
      onResponse({ response }) {
        // 可以在这里监控进度（如果服务器支持）
        fileObj.progress = 100
      }
    })

    if (response.success) {
      fileObj.success = true
      fileObj.progress = 100
    } else {
      fileObj.error = response.error || '上传失败'
    }
  } catch (error) {
    console.error('上传文件失败:', error)
    fileObj.error = '上传失败，请稍后重试'
  } finally {
    fileObj.uploading = false
  }
}

// 处理遮罩点击
const handleOverlayClick = () => {
  if (uploading.value) {
    if (!confirm('正在上传文件，确定要关闭吗？')) {
      return
    }
  }
  emit('close')
}

// 工具函数
const getFileIcon = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'Image'
  if (mimeType.startsWith('video/')) return 'Video'
  if (mimeType.startsWith('audio/')) return 'Music'
  if (mimeType.includes('pdf')) return 'FileText'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'FileText'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'FileText'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'FileText'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'Archive'
  return 'File'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 键盘快捷键
onMounted(() => {
  const handleKeyDown = (e) => {
    // Ctrl/Cmd + O 打开文件选择
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
      e.preventDefault()
      fileInput.value?.click()
    }
    // Escape 关闭
    if (e.key === 'Escape') {
      handleOverlayClick()
    }
  }

  document.addEventListener('keydown', handleKeyDown)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
})
</script>