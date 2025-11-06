<template>
  <div>
    <!-- 页面头部 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">用户管理</h1>
        <p class="text-gray-600 mt-1">管理系统用户账户、权限和访问控制</p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="showCreateModal = true"
          class="btn btn-primary"
        >
          <Icon name="UserPlus" class="w-4 h-4 mr-2" />
          新建用户
        </button>
        <button
          @click="refreshUsers"
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
              placeholder="搜索用户名或邮箱..."
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
            @change="refreshUsers"
          >
            <option value="">全部状态</option>
            <option value="active">活跃</option>
            <option value="inactive">未激活</option>
            <option value="suspended">已停用</option>
            <option value="banned">已封禁</option>
          </select>
        </div>

        <!-- 角色筛选 -->
        <div class="min-w-[120px]">
          <select
            v-model="roleFilter"
            class="form-select"
            @change="refreshUsers"
          >
            <option value="">全部角色</option>
            <option value="admin">管理员</option>
            <option value="editor">编辑</option>
            <option value="viewer">查看者</option>
          </select>
        </div>

        <!-- 注册时间筛选 -->
        <div class="min-w-[150px]">
          <select
            v-model="dateFilter"
            class="form-select"
            @change="refreshUsers"
          >
            <option value="">全部时间</option>
            <option value="today">今天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="year">今年</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-blue-100 rounded-lg p-3">
            <Icon name="Users" class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">总用户数</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.total || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-green-100 rounded-lg p-3">
            <Icon name="UserCheck" class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">活跃用户</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.active || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-purple-100 rounded-lg p-3">
            <Icon name="UserPlus" class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">新注册</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.newUsers || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
            <Icon name="AlertTriangle" class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">待审核</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.pending || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="card">
      <!-- 批量操作栏 -->
      <div v-if="selectedItems.length > 0" class="border-b border-gray-200 p-4 bg-gray-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">
              已选择 {{ selectedItems.length }} 个用户
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
              @click="batchActivate"
              class="btn btn-sm btn-success"
            >
              <Icon name="CheckCircle" class="w-4 h-4 mr-1" />
              批量激活
            </button>
            <button
              @click="batchSuspend"
              class="btn btn-sm btn-warning"
            >
              <Icon name="Pause" class="w-4 h-4 mr-1" />
              批量停用
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
      <div v-else-if="usersList.length === 0" class="text-center py-12">
        <Icon name="Users" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">暂无用户</h3>
        <p class="text-gray-600 mb-4">点击"新建用户"按钮添加第一个用户</p>
        <button
          @click="showCreateModal = true"
          class="btn btn-primary"
        >
          <Icon name="UserPlus" class="w-4 h-4 mr-2" />
          新建用户
        </button>
      </div>

      <!-- 用户表格 -->
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
              <th>用户</th>
              <th>角色</th>
              <th>状态</th>
              <th>注册时间</th>
              <th>最后登录</th>
              <th class="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in usersList"
              :key="user.id"
              class="hover:bg-gray-50"
            >
              <td>
                <input
                  type="checkbox"
                  :checked="selectedItems.includes(user.id)"
                  @change="toggleSelect(user.id)"
                  class="rounded border-gray-300"
                />
              </td>
              <td>
                <div class="flex items-center">
                  <div class="flex-shrink-0 mr-3">
                    <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <img
                        v-if="user.avatar"
                        :src="user.avatar"
                        :alt="user.username"
                        class="w-10 h-10 rounded-full object-cover"
                      />
                      <span v-else class="text-sm font-medium text-gray-600">
                        {{ user.username?.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ user.username }}</p>
                    <p class="text-sm text-gray-500">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td>
                <span
                  :class="getRoleClass(user.role)"
                  class="tag"
                >
                  {{ getRoleText(user.role) }}
                </span>
              </td>
              <td>
                <span
                  :class="getStatusClass(user.status)"
                  class="tag"
                >
                  {{ getStatusText(user.status) }}
                </span>
              </td>
              <td>
                <span class="text-sm text-gray-700">
                  {{ formatDate(user.createdAt) }}
                </span>
              </td>
              <td>
                <span class="text-sm text-gray-700">
                  {{ formatDate(user.lastLoginAt) }}
                </span>
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="viewUser(user)"
                    class="text-blue-600 hover:text-blue-800"
                    title="查看详情"
                  >
                    <Icon name="Eye" class="w-4 h-4" />
                  </button>
                  <button
                    @click="editUser(user)"
                    class="text-indigo-600 hover:text-indigo-800"
                    title="编辑"
                  >
                    <Icon name="Edit" class="w-4 h-4" />
                  </button>
                  <button
                    @click="resetPassword(user)"
                    class="text-yellow-600 hover:text-yellow-800"
                    title="重置密码"
                  >
                    <Icon name="Key" class="w-4 h-4" />
                  </button>
                  <button
                    v-if="user.status === 'active'"
                    @click="suspendUser(user)"
                    class="text-orange-600 hover:text-orange-800"
                    title="停用"
                  >
                    <Icon name="Pause" class="w-4 h-4" />
                  </button>
                  <button
                    v-else
                    @click="activateUser(user)"
                    class="text-green-600 hover:text-green-800"
                    title="激活"
                  >
                    <Icon name="Play" class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteUser(user)"
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

    <!-- 创建/编辑用户模态框 -->
    <UserModal
      v-if="showCreateModal || showEditModal"
      :user="editingUser"
      @save="handleSaveUser"
      @cancel="handleCancelModal"
    />

    <!-- 用户详情模态框 -->
    <UserDetail
      v-if="showDetailModal"
      :user="viewingUser"
      @close="showDetailModal = false"
      @edit="editUserFromDetail"
    />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

// 设置页面标题
useHead({
  title: '用户管理 - ChinaJoin CMS'
})

// 使用中间件
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()

// 状态
const loading = ref(false)
const usersList = ref([])
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
  active: 0,
  newUsers: 0,
  pending: 0
})

const searchQuery = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const dateFilter = ref('')
const selectedItems = ref([])

// 模态框状态
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const editingUser = ref(null)
const viewingUser = ref(null)

// 计算属性
const selectAllChecked = computed({
  get: () => usersList.value.length > 0 && selectedItems.value.length === usersList.value.length,
  set: (value) => {
    if (value) {
      selectedItems.value = usersList.value.map(item => item.id)
    } else {
      selectedItems.value = []
    }
  }
})

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/users', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value,
        status: statusFilter.value,
        role: roleFilter.value,
        date: dateFilter.value
      }
    })

    if (response.success) {
      usersList.value = response.data
      pagination.value = response.pagination
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await $fetch('/api/admin/users/stats')
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
  fetchUsers()
}, 300)

// 分页操作
const changePage = (page) => {
  pagination.value.page = page
  fetchUsers()
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
  selectedItems.value = usersList.value.map(item => item.id)
}

const clearSelection = () => {
  selectedItems.value = []
}

// 用户操作
const viewUser = (user) => {
  viewingUser.value = user
  showDetailModal.value = true
}

const editUser = (user) => {
  editingUser.value = user
  showEditModal.value = true
}

const editUserFromDetail = (user) => {
  showDetailModal.value = false
  editUser(user)
}

const resetPassword = async (user) => {
  if (!confirm(`确定要重置用户"${user.username}"的密码吗？`)) {
    return
  }

  try {
    const response = await $fetch(`/api/admin/users/${user.id}/reset-password`, {
      method: 'POST'
    })

    if (response.success) {
      alert(`新密码已生成：${response.data.password}\n请将此密码发送给用户`)
    } else {
      alert(response.error || '重置密码失败')
    }
  } catch (error) {
    console.error('重置密码失败:', error)
    alert('重置密码失败，请稍后重试')
  }
}

const activateUser = async (user) => {
  if (!confirm(`确定要激活用户"${user.username}"吗？`)) {
    return
  }

  try {
    const response = await $fetch(`/api/admin/users/${user.id}/activate`, {
      method: 'POST'
    })

    if (response.success) {
      await fetchUsers()
      await fetchStats()
    } else {
      alert(response.error || '激活失败')
    }
  } catch (error) {
    console.error('激活用户失败:', error)
    alert('激活失败，请稍后重试')
  }
}

const suspendUser = async (user) => {
  if (!confirm(`确定要停用用户"${user.username}"吗？`)) {
    return
  }

  try {
    const response = await $fetch(`/api/admin/users/${user.id}/suspend`, {
      method: 'POST'
    })

    if (response.success) {
      await fetchUsers()
      await fetchStats()
    } else {
      alert(response.error || '停用失败')
    }
  } catch (error) {
    console.error('停用用户失败:', error)
    alert('停用失败，请稍后重试')
  }
}

const deleteUser = async (user) => {
  if (!confirm(`确定要删除用户"${user.username}"吗？此操作不可撤销。`)) {
    return
  }

  try {
    const response = await $fetch(`/api/admin/users/${user.id}`, {
      method: 'DELETE'
    })

    if (response.success) {
      await fetchUsers()
      await fetchStats()
    } else {
      alert(response.error || '删除失败')
    }
  } catch (error) {
    console.error('删除用户失败:', error)
    alert('删除失败，请稍后重试')
  }
}

// 批量操作
const batchActivate = async () => {
  if (!confirm(`确定要激活选中的 ${selectedItems.value.length} 个用户吗？`)) {
    return
  }

  try {
    const response = await $fetch('/api/admin/users/batch-activate', {
      method: 'POST',
      body: { ids: selectedItems.value }
    })

    if (response.success) {
      await fetchUsers()
      await fetchStats()
      selectedItems.value = []
    } else {
      alert(response.error || '批量激活失败')
    }
  } catch (error) {
    console.error('批量激活失败:', error)
    alert('批量激活失败，请稍后重试')
  }
}

const batchSuspend = async () => {
  if (!confirm(`确定要停用选中的 ${selectedItems.value.length} 个用户吗？`)) {
    return
  }

  try {
    const response = await $fetch('/api/admin/users/batch-suspend', {
      method: 'POST',
      body: { ids: selectedItems.value }
    })

    if (response.success) {
      await fetchUsers()
      await fetchStats()
      selectedItems.value = []
    } else {
      alert(response.error || '批量停用失败')
    }
  } catch (error) {
    console.error('批量停用失败:', error)
    alert('批量停用失败，请稍后重试')
  }
}

const batchDelete = async () => {
  if (!confirm(`确定要删除选中的 ${selectedItems.value.length} 个用户吗？此操作不可撤销。`)) {
    return
  }

  try {
    const response = await $fetch('/api/admin/users/batch', {
      method: 'DELETE',
      body: { ids: selectedItems.value }
    })

    if (response.success) {
      await fetchUsers()
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
const handleSaveUser = async (userData) => {
  try {
    let response

    if (editingUser.value) {
      // 更新用户
      response = await $fetch(`/api/admin/users/${editingUser.value.id}`, {
        method: 'PUT',
        body: userData
      })
    } else {
      // 创建用户
      response = await $fetch('/api/admin/users', {
        method: 'POST',
        body: userData
      })
    }

    if (response.success) {
      await fetchUsers()
      await fetchStats()
      handleCancelModal()
      alert(editingUser.value ? '用户更新成功' : '用户创建成功')
    } else {
      alert(response.error || '操作失败')
    }
  } catch (error) {
    console.error('保存用户失败:', error)
    alert('操作失败，请稍后重试')
  }
}

const handleCancelModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingUser.value = null
}

// 刷新
const refreshUsers = async () => {
  pagination.value.page = 1
  selectedItems.value = []
  await Promise.all([
    fetchUsers(),
    fetchStats()
  ])
}

// 工具函数
const getRoleClass = (role) => {
  switch (role) {
    case 'admin':
      return 'tag-error'
    case 'editor':
      return 'tag-warning'
    case 'viewer':
      return 'tag-secondary'
    default:
      return 'tag-secondary'
  }
}

const getRoleText = (role) => {
  switch (role) {
    case 'admin':
      return '管理员'
    case 'editor':
      return '编辑'
    case 'viewer':
      return '查看者'
    default:
      return '用户'
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'active':
      return 'tag-success'
    case 'inactive':
      return 'tag-secondary'
    case 'suspended':
      return 'tag-warning'
    case 'banned':
      return 'tag-error'
    default:
      return 'tag-secondary'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'active':
      return '活跃'
    case 'inactive':
      return '未激活'
    case 'suspended':
      return '已停用'
    case 'banned':
      return '已封禁'
    default:
      return '未知'
  }
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
    fetchUsers(),
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