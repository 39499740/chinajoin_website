<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ isEdit ? '编辑分类' : '新建分类' }}
        </h3>

        <form @submit.prevent="handleSubmit">
          <!-- 分类名称 -->
          <div class="mb-4">
            <label class="form-label">分类名称 *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="form-input"
              placeholder="请输入分类名称"
            />
          </div>

          <!-- Slug -->
          <div class="mb-4">
            <label class="form-label">Slug</label>
            <input
              v-model="form.slug"
              type="text"
              class="form-input"
              placeholder="自动生成或手动输入"
            />
            <p class="text-xs text-gray-500 mt-1">
              留空将自动从分类名称生成
            </p>
          </div>

          <!-- 父分类 -->
          <div class="mb-4">
            <label class="form-label">父分类</label>
            <select
              v-model="form.parentId"
              class="form-input"
            >
              <option value="">无（顶级分类）</option>
              <option
                v-for="category in parentCategories"
                :key="category.id"
                :value="category.id"
                :disabled="category.id === category?.id"
              >
                {{ '  '.repeat(category.level) }}{{ category.name }}
              </option>
            </select>
          </div>

          <!-- 描述 -->
          <div class="mb-4">
            <label class="form-label">描述</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="form-input"
              placeholder="分类描述（可选）"
            ></textarea>
          </div>

          <!-- 按钮组 -->
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="$emit('cancel')"
              class="btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="btn-primary"
            >
              <span v-if="loading">保存中...</span>
              <span v-else>保存</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  category: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'cancel'])

// 状态
const loading = ref(false)
const form = ref({
  name: '',
  slug: '',
  description: '',
  parentId: ''
})

// 计算属性
const isEdit = computed(() => !!props.category)

// 过滤父分类选项（排除自己和子分类）
const parentCategories = computed(() => {
  if (!isEdit.value) {
    return props.categories
  }

  const getChildrenIds = (category) => {
    const ids = [category.id]
    const children = props.categories.filter(c => c.parentId === category.id)
    for (const child of children) {
      ids.push(...getChildrenIds(child))
    }
    return ids
  }

  const excludeIds = getChildrenIds(props.category)
  return props.categories.filter(c => !excludeIds.includes(c.id))
})

// 初始化表单数据
const initForm = () => {
  if (props.category) {
    form.value = {
      name: props.category.name || '',
      slug: props.category.slug || '',
      description: props.category.description || '',
      parentId: props.category.parentId || ''
    }
  } else {
    form.value = {
      name: '',
      slug: '',
      description: '',
      parentId: ''
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    alert('请输入分类名称')
    return
  }

  loading.value = true

  try {
    await emit('save', {
      name: form.value.name.trim(),
      slug: form.value.slug.trim() || undefined,
      description: form.value.description.trim() || undefined,
      parentId: form.value.parentId || undefined
    })
  } finally {
    loading.value = false
  }
}

// 监听 props 变化
watch(() => props.category, () => {
  initForm()
}, { immediate: true })
</script>