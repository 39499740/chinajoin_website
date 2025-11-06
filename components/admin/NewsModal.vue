<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <!-- 模态框头部 -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ news?.id ? '编辑新闻' : '新建新闻' }}
        </h2>
        <button
          @click="$emit('cancel')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="X" class="w-5 h-5" />
        </button>
      </div>

      <!-- 表单内容 -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 基本信息 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 主要内容区域 -->
          <div class="lg:col-span-2 space-y-6">
            <!-- 标题 -->
            <div>
              <label class="form-label">
                新闻标题 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.title"
                type="text"
                required
                :maxlength="200"
                class="form-input"
                placeholder="请输入新闻标题"
              />
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-500">请输入简洁明确的标题</span>
                <span class="text-xs text-gray-500">{{ formData.title?.length || 0 }}/200</span>
              </div>
            </div>

            <!-- 摘要 -->
            <div>
              <label class="form-label">
                新闻摘要 <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="formData.excerpt"
                required
                :maxlength="500"
                rows="3"
                class="form-textarea"
                placeholder="请输入新闻摘要，用于搜索引擎和列表展示"
              />
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-500">建议控制在100-200字以内</span>
                <span class="text-xs text-gray-500">{{ formData.excerpt?.length || 0 }}/500</span>
              </div>
            </div>

            <!-- 内容 -->
            <div>
              <label class="form-label">
                新闻内容 <span class="text-red-500">*</span>
              </label>
              <div class="border border-gray-300 rounded-lg overflow-hidden">
                <!-- 工具栏 -->
                <div class="bg-gray-50 border-b border-gray-300 px-4 py-2 flex items-center space-x-2">
                  <div class="flex items-center space-x-1">
                    <button
                      type="button"
                      @click="insertFormatting('**', '**')"
                      class="toolbar-btn"
                      title="粗体"
                    >
                      <Icon name="Bold" class="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      @click="insertFormatting('*', '*')"
                      class="toolbar-btn"
                      title="斜体"
                    >
                      <Icon name="Italic" class="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      @click="insertHeading"
                      class="toolbar-btn"
                      title="标题"
                    >
                      <Icon name="Heading" class="w-4 h-4" />
                    </button>
                    <div class="w-px h-4 bg-gray-300 mx-1"></div>
                    <button
                      type="button"
                      @click="insertList('ordered')"
                      class="toolbar-btn"
                      title="有序列表"
                    >
                      <Icon name="List" class="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      @click="insertList('unordered')"
                      class="toolbar-btn"
                      title="无序列表"
                    >
                      <Icon name="List" class="w-4 h-4" />
                    </button>
                    <div class="w-px h-4 bg-gray-300 mx-1"></div>
                    <button
                      type="button"
                      @click="insertLink"
                      class="toolbar-btn"
                      title="插入链接"
                    >
                      <Icon name="Link" class="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      @click="insertImage"
                      class="toolbar-btn"
                      title="插入图片"
                    >
                      <Icon name="Image" class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- 编辑器 -->
                <div class="grid grid-cols-1 lg:grid-cols-2 h-96">
                  <!-- 输入区域 -->
                  <div class="border-r border-gray-300">
                    <textarea
                      v-model="formData.content"
                      required
                      class="w-full h-full p-4 resize-none focus:outline-none"
                      placeholder="请输入新闻内容，支持 Markdown 格式&#10;&#10;# 一级标题&#10;## 二级标题&#10;**粗体** *斜体*&#10;- 无序列表&#10;1. 有序列表&#10;[链接文字](URL)"
                      @input="updatePreview"
                    />
                  </div>

                  <!-- 预览区域 -->
                  <div class="bg-gray-50 p-4 overflow-y-auto">
                    <div
                      v-if="formData.content"
                      class="prose prose-sm max-w-none"
                      v-html="previewContent"
                    />
                    <div
                      v-else
                      class="text-gray-400 text-sm"
                    >
                      预览区域
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex justify-between mt-1">
                <span class="text-xs text-gray-500">支持 Markdown 格式</span>
                <span class="text-xs text-gray-500">{{ formData.content?.length || 0 }} 字符</span>
              </div>
            </div>
          </div>

          <!-- 侧边栏设置 -->
          <div class="space-y-6">
            <!-- 分类 -->
            <div>
              <label class="form-label">
                新闻分类 <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.categoryId"
                required
                class="form-select"
              >
                <option value="">请选择分类</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>

            <!-- 状态 -->
            <div>
              <label class="form-label">
                发布状态 <span class="text-red-500">*</span>
              </label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="formData.status"
                    type="radio"
                    value="draft"
                    class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                  />
                  <span class="ml-2 text-sm">草稿</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="formData.status"
                    type="radio"
                    value="published"
                    class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                  />
                  <span class="ml-2 text-sm">立即发布</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="formData.status"
                    type="radio"
                    value="scheduled"
                    class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                  />
                  <span class="ml-2 text-sm">定时发布</span>
                </label>
              </div>
            </div>

            <!-- 定时发布 -->
            <div v-if="formData.status === 'scheduled'">
              <label class="form-label">发布时间</label>
              <input
                v-model="formData.publishedAt"
                type="datetime-local"
                class="form-input"
              />
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
                    placeholder="留空则使用新闻标题"
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
                    placeholder="留空则使用新闻摘要"
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

            <!-- 特色图片 -->
            <div class="border-t pt-6">
              <h3 class="text-sm font-medium text-gray-900 mb-4">特色图片</h3>
              <div
                class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors"
                @click="$refs.featuredImage.click()"
              >
                <input
                  ref="featuredImage"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleImageUpload"
                />
                <div v-if="!formData.featuredImage" class="space-y-2">
                  <Icon name="Upload" class="w-8 h-8 text-gray-400 mx-auto" />
                  <p class="text-sm text-gray-600">点击上传特色图片</p>
                  <p class="text-xs text-gray-500">支持 JPG、PNG、GIF 格式</p>
                </div>
                <div v-else class="space-y-2">
                  <img
                    :src="formData.featuredImage"
                    alt="特色图片"
                    class="w-full h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    @click.stop="removeFeaturedImage"
                    class="text-sm text-red-600 hover:text-red-800"
                  >
                    移除图片
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center justify-between pt-6 border-t">
          <div class="text-sm text-gray-500">
            <span v-if="news?.id">最后修改：{{ formatDate(news.updatedAt) }}</span>
          </div>
          <div class="flex items-center space-x-3">
            <button
              type="button"
              @click="$emit('cancel')"
              class="btn btn-secondary"
            >
              取消
            </button>
            <button
              v-if="formData.status === 'draft'"
              type="button"
              @click="handleSaveDraft"
              :disabled="!isFormValid || saving"
              class="btn btn-outline"
            >
              保存草稿
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
                {{ news?.id ? '更新新闻' : '发布新闻' }}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { marked } from 'marked'

// Props
const props = defineProps({
  news: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['save', 'cancel'])

// 状态
const saving = ref(false)
const previewContent = ref('')

// 表单数据
const formData = ref({
  title: '',
  excerpt: '',
  content: '',
  categoryId: '',
  status: 'draft',
  publishedAt: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  featuredImage: ''
})

// 计算属性
const isFormValid = computed(() => {
  return formData.value.title.trim() &&
         formData.value.excerpt.trim() &&
         formData.value.content.trim() &&
         formData.value.categoryId &&
         (formData.value.status !== 'scheduled' || formData.value.publishedAt)
})

// 初始化表单数据
const initFormData = () => {
  if (props.news) {
    formData.value = {
      title: props.news.title || '',
      excerpt: props.news.excerpt || '',
      content: props.news.content || '',
      categoryId: props.news.categoryId || '',
      status: props.news.status || 'draft',
      publishedAt: props.news.publishedAt ?
        new Date(props.news.publishedAt).toISOString().slice(0, 16) : '',
      seoTitle: props.news.seoTitle || '',
      seoDescription: props.news.seoDescription || '',
      seoKeywords: props.news.seoKeywords || '',
      featuredImage: props.news.featuredImage || ''
    }
    updatePreview()
  } else {
    // 重置为默认值
    formData.value = {
      title: '',
      excerpt: '',
      content: '',
      categoryId: '',
      status: 'draft',
      publishedAt: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      featuredImage: ''
    }
    previewContent.value = ''
  }
}

// 更新预览
const updatePreview = () => {
  try {
    previewContent.value = marked(formData.value.content || '')
  } catch (error) {
    console.error('Markdown 解析失败:', error)
    previewContent.value = '<p class="text-red-500">Markdown 格式错误</p>'
  }
}

// 插入格式化文本
const insertFormatting = (before, after) => {
  const textarea = event.target.form?.querySelector('textarea[name="content"]')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = formData.value.content.substring(start, end)
  const replacement = before + selectedText + after

  formData.value.content =
    formData.value.content.substring(0, start) +
    replacement +
    formData.value.content.substring(end)

  // 重新设置光标位置
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(
      start + before.length,
      start + before.length + selectedText.length
    )
  })

  updatePreview()
}

// 插入标题
const insertHeading = () => {
  const textarea = event.target.form?.querySelector('textarea[name="content"]')
  if (!textarea) return

  const start = textarea.selectionStart
  const heading = '## '

  formData.value.content =
    formData.value.content.substring(0, start) +
    heading +
    formData.value.content.substring(start)

  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + heading.length, start + heading.length)
  })
}

// 插入列表
const insertList = (type) => {
  const textarea = event.target.form?.querySelector('textarea[name="content"]')
  if (!textarea) return

  const start = textarea.selectionStart
  const prefix = type === 'ordered' ? '1. ' : '- '

  formData.value.content =
    formData.value.content.substring(0, start) +
    prefix +
    formData.value.content.substring(start)

  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + prefix.length, start + prefix.length)
  })
}

// 插入链接
const insertLink = () => {
  const url = prompt('请输入链接地址:', 'https://')
  if (!url) return

  const textarea = event.target.form?.querySelector('textarea[name="content"]')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = formData.value.content.substring(start, end) || '链接文字'
  const linkText = `[${selectedText}](${url})`

  formData.value.content =
    formData.value.content.substring(0, start) +
    linkText +
    formData.value.content.substring(end)

  updatePreview()
}

// 插入图片
const insertImage = () => {
  const url = prompt('请输入图片地址:', 'https://')
  if (!url) return

  const textarea = event.target.form?.querySelector('textarea[name="content"]')
  if (!textarea) return

  const start = textarea.selectionStart
  const alt = prompt('请输入图片描述:', '') || ''
  const imageText = `![${alt}](${url})`

  formData.value.content =
    formData.value.content.substring(0, start) +
    imageText +
    formData.value.content.substring(start)

  updatePreview()
}

// 处理图片上传
const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  // 检查文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过 5MB')
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await $fetch('/api/admin/upload', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      formData.value.featuredImage = response.data.url
    } else {
      alert('上传失败: ' + response.error)
    }
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败，请稍后重试')
  }

  // 重置文件输入
  event.target.value = ''
}

// 移除特色图片
const removeFeaturedImage = () => {
  formData.value.featuredImage = ''
}

// 保存草稿
const handleSaveDraft = async () => {
  const originalStatus = formData.value.status
  formData.value.status = 'draft'
  await handleSubmit()
  formData.value.status = originalStatus
}

// 提交表单
const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('请填写所有必填字段')
    return
  }

  saving.value = true
  try {
    const data = { ...formData.value }

    // 如果没有设置SEO信息，使用默认值
    if (!data.seoTitle) data.seoTitle = data.title
    if (!data.seoDescription) data.seoDescription = data.excerpt

    emit('save', data)
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

// 处理遮罩点击
const handleOverlayClick = () => {
  if (hasUnsavedChanges()) {
    if (confirm('您有未保存的更改，确定要关闭吗？')) {
      emit('cancel')
    }
  } else {
    emit('cancel')
  }
}

// 检查是否有未保存的更改
const hasUnsavedChanges = () => {
  if (!props.news) {
    return Object.values(formData.value).some(value =>
      value && typeof value === 'string' && value.trim()
    )
  }

  // 比较当前数据和原始数据
  return JSON.stringify(formData.value) !== JSON.stringify({
    title: props.news.title || '',
    excerpt: props.news.excerpt || '',
    content: props.news.content || '',
    categoryId: props.news.categoryId || '',
    status: props.news.status || 'draft',
    publishedAt: props.news.publishedAt ?
      new Date(props.news.publishedAt).toISOString().slice(0, 16) : '',
    seoTitle: props.news.seoTitle || '',
    seoDescription: props.news.seoDescription || '',
    seoKeywords: props.news.seoKeywords || '',
    featuredImage: props.news.featuredImage || ''
  })
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 监听 news 变化
watch(() => props.news, () => {
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

<style scoped>
.toolbar-btn {
  @apply px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors;
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
}

.prose h2 {
  font-size: 1.5em;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.75em;
}

.prose h3 {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.prose p {
  margin-bottom: 1em;
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
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125em 0.25em;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.prose pre {
  background-color: #f3f4f6;
  padding: 1em;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1em;
}

.prose img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin-bottom: 1em;
}

.prose a {
  color: #18a058;
  text-decoration: underline;
}

.prose a:hover {
  color: #16a34a;
}
</style>