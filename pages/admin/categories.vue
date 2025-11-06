<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">分类管理</h1>
        <p class="text-gray-600 mt-1">管理新闻分类，支持层级结构</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="btn-primary"
      >
        新建分类
      </button>
    </div>

    <!-- 搜索栏 -->
    <div class="card mb-6">
      <div class="flex items-center">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索分类名称或描述..."
          class="form-input mr-4"
          @input="handleSearch"
        />
        <button
          @click="handleSearch"
          class="btn-secondary"
        >
          搜索
        </button>
      </div>
    </div>

    <!-- 分类列表 -->
    <div class="card">
      <div v-if="loading" class="text-center py-8 text-gray-500">
        加载中...
      </div>

      <div v-else-if="categories.length === 0" class="text-center py-8 text-gray-500">
        暂无分类
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分类名称
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  父分类
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  新闻数量
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <template v-for="category in categories" :key="category.id">
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div
                        v-if="category.level > 0"
                        :style="{ marginLeft: `${category.level * 20}px` }"
                        class="text-gray-400 mr-2"
                      >
                        ├─
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">
                          {{ category.name }}
                        </div>
                        <div v-if="category.description" class="text-sm text-gray-500">
                          {{ category.description }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ category.slug }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ category.parent?.name || '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ category._count?.news || 0 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(category.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      @click="editCategory(category)"
                      class="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      编辑
                    </button>
                    <button
                      @click="deleteCategory(category)"
                      class="text-red-600 hover:text-red-900"
                      :disabled="category._count?.news > 0 || category._count?.children > 0"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 创建/编辑分类弹窗 -->
    <CategoryModal
      v-if="showCreateModal || showEditModal"
      :category="editingCategory"
      :categories="flatCategories"
      @save="handleSaveCategory"
      @cancel="handleCancelModal"
    />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

// 设置页面标题
useHead({
  title: '分类管理 - ChinaJoin CMS'
})

// 使用中间件
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()

// 状态
const loading = ref(true)
const categories = ref([])
const flatCategories = ref([])
const searchQuery = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingCategory = ref(null)

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await $fetch('/api/admin/categories', {
      query: { search: searchQuery.value }
    })

    if (response.success) {
      // 扁平化分类列表
      const flatten = (items, level = 0) => {
        const result = []
        for (const item of items) {
          result.push({ ...item, level })
          if (item.children && item.children.length > 0) {
            result.push(...flatten(item.children, level + 1))
          }
        }
        return result
      }

      categories.value = response.data
      flatCategories.value = flatten(response.data)
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  fetchCategories()
}

// 编辑分类
const editCategory = (category) => {
  editingCategory.value = category
  showEditModal.value = true
}

// 删除分类
const deleteCategory = async (category) => {
  if (category._count?.news > 0) {
    alert('该分类下还有新闻，无法删除')
    return
  }

  if (category._count?.children > 0) {
    alert('该分类下还有子分类，无法删除')
    return
  }

  if (!confirm(`确定要删除分类"${category.name}"吗？`)) {
    return
  }

  try {
    const response = await $fetch(`/api/admin/categories/${category.id}`, {
      method: 'DELETE'
    })

    if (response.success) {
      await fetchCategories()
      alert('分类删除成功')
    } else {
      alert(response.error || '删除失败')
    }
  } catch (error) {
    console.error('删除分类失败:', error)
    alert('删除失败，请稍后重试')
  }
}

// 保存分类
const handleSaveCategory = async (categoryData) => {
  try {
    let response

    if (editingCategory.value) {
      // 更新分类
      response = await $fetch(`/api/admin/categories/${editingCategory.value.id}`, {
        method: 'PUT',
        body: categoryData
      })
    } else {
      // 创建分类
      response = await $fetch('/api/admin/categories', {
        method: 'POST',
        body: categoryData
      })
    }

    if (response.success) {
      await fetchCategories()
      handleCancelModal()
      alert(editingCategory.value ? '分类更新成功' : '分类创建成功')
    } else {
      alert(response.error || '操作失败')
    }
  } catch (error) {
    console.error('保存分类失败:', error)
    alert('操作失败，请稍后重试')
  }
}

// 取消弹窗
const handleCancelModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingCategory.value = null
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 页面加载时获取数据
onMounted(() => {
  fetchCategories()
})
</script>