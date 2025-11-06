<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content max-w-2xl" @click.stop>
      <!-- 模态框头部 -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">编辑媒体信息</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="X" class="w-5 h-5" />
        </button>
      </div>

      <!-- 表单内容 -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 文件预览 -->
        <div class="flex justify-center">
          <div class="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              v-if="media.type === 'image'"
              :src="media.url"
              :alt="media.name"
              class="w-full h-full object-cover"
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
        </div>

        <!-- 基本信息 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="form-label">
              文件名 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="form-input"
              placeholder="请输入文件名"
            />
          </div>

          <div>
            <label class="form-label">
              文件标题
            </label>
            <input
              v-model="formData.title"
              type="text"
              class="form-input"
              placeholder="请输入文件标题（可选）"
            />
          </div>
        </div>

        <div>
          <label class="form-label">
            文件描述
          </label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="form-textarea"
            placeholder="请输入文件描述（可选）"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="form-label">
              替代文本 (Alt Text)
            </label>
            <input
              v-model="formData.altText"
              type="text"
              class="form-input"
              placeholder="用于无障碍访问和SEO"
            />
            <p class="text-xs text-gray-500 mt-1">
              主要用于图片，提高网站可访问性
            </p>
          </div>

          <div>
            <label class="form-label">
              文件分类
            </label>
            <select v-model="formData.category" class="form-select">
              <option value="">未分类</option>
              <option value="banner">横幅图片</option>
              <option value="content">内容配图</option>
              <option value="product">产品图片</option>
              <option value="avatar">头像图片</option>
              <option value="document">文档文件</option>
              <option value="video">视频文件</option>
              <option value="other">其他文件</option>
            </select>
          </div>
        </div>

        <!-- 图片专用设置 -->
        <div v-if="media.type === 'image'" class="border-t pt-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">图片设置</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">图片尺寸</label>
              <div class="flex items-center space-x-2">
                <input
                  v-model.number="formData.width"
                  type="number"
                  min="1"
                  class="form-input"
                  placeholder="宽度"
                />
                <span class="text-gray-500">×</span>
                <input
                  v-model.number="formData.height"
                  type="number"
                  min="1"
                  class="form-input"
                  placeholder="高度"
                />
                <button
                  type="button"
                  @click="resetDimensions"
                  class="btn btn-sm btn-outline"
                >
                  重置
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                原始尺寸：{{ originalDimensions }}
              </p>
            </div>

            <div>
              <label class="form-label">图片质量</label>
              <select v-model="formData.quality" class="form-select">
                <option value="high">高质量</option>
                <option value="medium">中等质量</option>
                <option value="low">低质量</option>
              </select>
            </div>
          </div>
        </div>

        <!-- SEO设置 -->
        <div class="border-t pt-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">SEO 设置</h3>
          <div class="space-y-4">
            <div>
              <label class="form-label">SEO 标题</label>
              <input
                v-model="formData.seoTitle"
                type="text"
                :maxlength="60"
                class="form-input"
                placeholder="留空则使用文件名"
              />
              <div class="text-xs text-gray-500 mt-1">
                {{ formData.seoTitle?.length || 0 }}/60
              </div>
            </div>

            <div>
              <label class="form-label">SEO 描述</label>
              <textarea
                v-model="formData.seoDescription"
                :maxlength="160"
                rows="2"
                class="form-textarea"
                placeholder="留空则使用文件描述"
              />
              <div class="text-xs text-gray-500 mt-1">
                {{ formData.seoDescription?.length || 0 }}/160
              </div>
            </div>

            <div>
              <label class="form-label">SEO 关键词</label>
              <input
                v-model="formData.seoKeywords"
                type="text"
                class="form-input"
                placeholder="多个关键词用逗号分隔"
              />
            </div>
          </div>
        </div>

        <!-- 高级设置 -->
        <div class="border-t pt-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">高级设置</h3>
          <div class="space-y-4">
            <div class="flex items-center">
              <input
                v-model="formData.isPublic"
                type="checkbox"
                id="isPublic"
                class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
              />
              <label for="isPublic" class="ml-2 text-sm text-gray-700">
                公开访问（允许任何人访问此文件）
              </label>
            </div>

            <div class="flex items-center">
              <input
                v-model="formData.allowDownload"
                type="checkbox"
                id="allowDownload"
                class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
              />
              <label for="allowDownload" class="ml-2 text-sm text-gray-700">
                允许下载
              </label>
            </div>

            <div class="flex items-center">
              <input
                v-model="formData.trackViews"
                type="checkbox"
                id="trackViews"
                class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
              />
              <label for="trackViews" class="ml-2 text-sm text-gray-700">
                统计访问次数
              </label>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center justify-between pt-6 border-t">
          <div class="text-sm text-gray-500">
            上传时间：{{ formatDate(media.createdAt) }}
            <span v-if="media.updatedAt !== media.createdAt">
              • 最后修改：{{ formatDate(media.updatedAt) }}
            </span>
          </div>
          <div class="flex items-center space-x-3">
            <button
              type="button"
              @click="$emit('close')"
              class="btn btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="!isFormValid || saving"
              class="btn btn-primary"
            >
              <span v-if="saving" class="flex items-center">
                <div class="loading-spinner w-4 h-4 mr-2"></div>
                保存中...
              </span>
              <span v-else>
                保存更改
              </span>
            </button>
          </div>
        </div>
      </form>
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
const emit = defineEmits(['close', 'updated'])

// 状态
const saving = ref(false)

// 表单数据
const formData = ref({
  name: '',
  title: '',
  description: '',
  altText: '',
  category: '',
  width: null,
  height: null,
  quality: 'high',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  isPublic: true,
  allowDownload: true,
  trackViews: true
})

// 计算属性
const isFormValid = computed(() => {
  return formData.value.name.trim()
})

const originalDimensions = computed(() => {
  if (props.media.dimensions) {
    return `${props.media.dimensions.width} × ${props.media.dimensions.height} px`
  }
  return '未知'
})

// 初始化表单数据
const initFormData = () => {
  formData.value = {
    name: props.media.name || '',
    title: props.media.title || '',
    description: props.media.description || '',
    altText: props.media.altText || '',
    category: props.media.category || '',
    width: props.media.dimensions?.width || null,
    height: props.media.dimensions?.height || null,
    quality: props.media.quality || 'high',
    seoTitle: props.media.seoTitle || '',
    seoDescription: props.media.seoDescription || '',
    seoKeywords: props.media.seoKeywords || '',
    isPublic: props.media.isPublic !== false,
    allowDownload: props.media.allowDownload !== false,
    trackViews: props.media.trackViews !== false
  }
}

// 重置尺寸
const resetDimensions = () => {
  if (props.media.dimensions) {
    formData.value.width = props.media.dimensions.width
    formData.value.height = props.media.dimensions.height
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('请填写必填字段')
    return
  }

  saving.value = true
  try {
    const data = { ...formData.value }

    // 如果没有设置SEO信息，使用默认值
    if (!data.seoTitle) data.seoTitle = data.title || data.name
    if (!data.seoDescription) data.seoDescription = data.description

    const response = await $fetch(`/api/admin/media/${props.media.id}`, {
      method: 'PUT',
      body: data
    })

    if (response.success) {
      emit('updated')
    } else {
      alert(response.error || '更新失败')
    }
  } catch (error) {
    console.error('更新媒体失败:', error)
    alert('更新失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

// 处理遮罩点击
const handleOverlayClick = () => {
  if (hasUnsavedChanges()) {
    if (confirm('您有未保存的更改，确定要关闭吗？')) {
      emit('close')
    }
  } else {
    emit('close')
  }
}

// 检查是否有未保存的更改
const hasUnsavedChanges = () => {
  return JSON.stringify(formData.value) !== JSON.stringify({
    name: props.media.name || '',
    title: props.media.title || '',
    description: props.media.description || '',
    altText: props.media.altText || '',
    category: props.media.category || '',
    width: props.media.dimensions?.width || null,
    height: props.media.dimensions?.height || null,
    quality: props.media.quality || 'high',
    seoTitle: props.media.seoTitle || '',
    seoDescription: props.media.seoDescription || '',
    seoKeywords: props.media.seoKeywords || '',
    isPublic: props.media.isPublic !== false,
    allowDownload: props.media.allowDownload !== false,
    trackViews: props.media.trackViews !== false
  })
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

// 监听 media 变化
watch(() => props.media, () => {
  initFormData()
}, { immediate: true })

// 键盘快捷键
onMounted(() => {
  const handleKeyDown = (e) => {
    // Ctrl/Cmd + S 保存
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      handleSubmit()
    }
    // Esc 关闭
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