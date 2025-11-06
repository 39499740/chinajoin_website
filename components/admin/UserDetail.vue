<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content max-w-4xl" @click.stop>
      <!-- 模态框头部 -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">用户详情</h2>
        <div class="flex items-center space-x-2">
          <button
            @click="$emit('edit', user)"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            title="编辑"
          >
            <Icon name="Edit" class="w-5 h-5" />
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
        <!-- 左侧：用户基本信息 -->
        <div class="lg:col-span-1">
          <div class="card">
            <!-- 头像和基本信息 -->
            <div class="text-center pb-6 border-b border-gray-200">
              <div class="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                <img
                  v-if="user.avatar"
                  :src="user.avatar"
                  :alt="user.username"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <span class="text-2xl font-bold text-gray-600">
                    {{ user.username?.charAt(0).toUpperCase() }}
                  </span>
                </div>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">
                {{ user.firstName }} {{ user.lastName }}
              </h3>
              <p class="text-gray-600">@{{ user.username }}</p>
              <div class="mt-3">
                <span
                  :class="getRoleClass(user.role)"
                  class="tag"
                >
                  {{ getRoleText(user.role) }}
                </span>
                <span
                  :class="getStatusClass(user.status)"
                  class="tag ml-2"
                >
                  {{ getStatusText(user.status) }}
                </span>
              </div>
            </div>

            <!-- 联系信息 -->
            <div class="py-6 border-b border-gray-200">
              <h4 class="text-sm font-medium text-gray-900 mb-4">联系信息</h4>
              <div class="space-y-3">
                <div class="flex items-center text-sm">
                  <Icon name="Mail" class="w-4 h-4 text-gray-400 mr-3" />
                  <span class="text-gray-700">{{ user.email }}</span>
                </div>
                <div v-if="user.phone" class="flex items-center text-sm">
                  <Icon name="Phone" class="w-4 h-4 text-gray-400 mr-3" />
                  <span class="text-gray-700">{{ user.phone }}</span>
                </div>
              </div>
            </div>

            <!-- 账户信息 -->
            <div class="py-6 border-b border-gray-200">
              <h4 class="text-sm font-medium text-gray-900 mb-4">账户信息</h4>
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">用户ID</span>
                  <span class="text-gray-900 font-mono">{{ user.id }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">注册时间</span>
                  <span class="text-gray-900">{{ formatDate(user.createdAt) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">最后登录</span>
                  <span class="text-gray-900">{{ formatDate(user.lastLoginAt) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">登录次数</span>
                  <span class="text-gray-900">{{ user.loginCount || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- 安全设置 -->
            <div class="py-6">
              <h4 class="text-sm font-medium text-gray-900 mb-4">安全设置</h4>
              <div class="space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">两步验证</span>
                  <span
                    :class="user.twoFactorEnabled ? 'text-green-600' : 'text-gray-400'"
                  >
                    {{ user.twoFactorEnabled ? '已启用' : '未启用' }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">邮件验证</span>
                  <span
                    :class="user.emailVerified ? 'text-green-600' : 'text-orange-600'"
                  >
                    {{ user.emailVerified ? '已验证' : '待验证' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：详细信息 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 个人简介 -->
          <div v-if="user.bio" class="card">
            <h3 class="text-sm font-medium text-gray-900 mb-3">个人简介</h3>
            <p class="text-gray-700">{{ user.bio }}</p>
          </div>

          <!-- 活动统计 -->
          <div class="card">
            <h3 class="text-sm font-medium text-gray-900 mb-4">活动统计</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-2xl font-semibold text-gray-900">{{ stats.posts || 0 }}</p>
                <p class="text-sm text-gray-600">发布文章</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-2xl font-semibold text-gray-900">{{ stats.comments || 0 }}</p>
                <p class="text-sm text-gray-600">评论数</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-2xl font-semibold text-gray-900">{{ stats.mediaFiles || 0 }}</p>
                <p class="text-sm text-gray-600">媒体文件</p>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-2xl font-semibold text-gray-900">{{ stats.views || 0 }}</p>
                <p class="text-sm text-gray-600">总浏览量</p>
              </div>
            </div>
          </div>

          <!-- 权限详情 -->
          <div class="card">
            <h3 class="text-sm font-medium text-gray-900 mb-4">权限详情</h3>
            <div class="space-y-4">
              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-2">内容管理</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div class="flex items-center text-sm">
                    <Icon
                      :name="hasPermission('content', 'create') ? 'CheckCircle' : 'XCircle'"
                      :class="hasPermission('content', 'create') ? 'text-green-500' : 'text-red-500'"
                      class="w-4 h-4 mr-2"
                    />
                    <span>创建内容</span>
                  </div>
                  <div class="flex items-center text-sm">
                    <Icon
                      :name="hasPermission('content', 'edit') ? 'CheckCircle' : 'XCircle'"
                      :class="hasPermission('content', 'edit') ? 'text-green-500' : 'text-red-500'"
                      class="w-4 h-4 mr-2"
                    />
                    <span>编辑内容</span>
                  </div>
                  <div class="flex items-center text-sm">
                    <Icon
                      :name="hasPermission('content', 'delete') ? 'CheckCircle' : 'XCircle'"
                      :class="hasPermission('content', 'delete') ? 'text-green-500' : 'text-red-500'"
                      class="w-4 h-4 mr-2"
                    />
                    <span>删除内容</span>
                  </div>
                  <div class="flex items-center text-sm">
                    <Icon
                      :name="hasPermission('content', 'publish') ? 'CheckCircle' : 'XCircle'"
                      :class="hasPermission('content', 'publish') ? 'text-green-500' : 'text-red-500'"
                      class="w-4 h-4 mr-2"
                    />
                    <span>发布内容</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-2">用户管理</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div class="flex items-center text-sm">
                    <Icon
                      :name="hasPermission('users', 'create') ? 'CheckCircle' : 'XCircle'"
                      :class="hasPermission('users', 'create') ? 'text-green-500' : 'text-red-500'"
                      class="w-4 h-4 mr-2"
                    />
                    <span>创建用户</span>
                  </div>
                  <div class="flex items-center text-sm">
                    <Icon
                      :name="hasPermission('users', 'edit') ? 'CheckCircle' : 'XCircle'"
                      :class="hasPermission('users', 'edit') ? 'text-green-500' : 'text-red-500'"
                      class="w-4 h-4 mr-2"
                    />
                    <span>编辑用户</span>
                  </div>
                  <div class="flex items-center text-sm">
                    <Icon
                      :name="hasPermission('users', 'delete') ? 'CheckCircle' : 'XCircle'"
                      :class="hasPermission('users', 'delete') ? 'text-green-500' : 'text-red-500'"
                      class="w-4 h-4 mr-2"
                    />
                    <span>删除用户</span>
                  </div>
                  <div class="flex items-center text-sm">
                    <Icon
                      :name="hasPermission('users', 'manage_roles') ? 'CheckCircle' : 'XCircle'"
                      :class="hasPermission('users', 'manage_roles') ? 'text-green-500' : 'text-red-500'"
                      class="w-4 h-4 mr-2"
                    />
                    <span>管理角色</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-sm font-medium text-gray-700 mb-2">系统设置</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div class="flex items-center text-sm">
                    <Icon
                      :name="hasPermission('settings', 'view') ? 'CheckCircle' : 'XCircle'"
                      :class="hasPermission('settings', 'view') ? 'text-green-500' : 'text-red-500'"
                      class="w-4 h-4 mr-2"
                    />
                    <span>查看设置</span>
                  </div>
                  <div class="flex items-center text-sm">
                    <Icon
                      :name="hasPermission('settings', 'edit') ? 'CheckCircle' : 'XCircle'"
                      :class="hasPermission('settings', 'edit') ? 'text-green-500' : 'text-red-500'"
                      class="w-4 h-4 mr-2"
                    />
                    <span>修改设置</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 最近活动 -->
          <div class="card">
            <h3 class="text-sm font-medium text-gray-900 mb-4">最近活动</h3>
            <div class="space-y-4">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="flex items-start space-x-3"
              >
                <div
                  class="flex-shrink-0 w-2 h-2 rounded-full mt-2"
                  :class="getActivityColor(activity.type)"
                ></div>
                <div class="flex-1">
                  <p class="text-sm text-gray-900">{{ activity.description }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(activity.createdAt) }}</p>
                </div>
              </div>
              <div v-if="recentActivities.length === 0" class="text-center py-4">
                <p class="text-gray-500">暂无活动记录</p>
              </div>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="card">
            <h3 class="text-sm font-medium text-gray-900 mb-4">快速操作</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                @click="resetPassword"
                class="btn btn-outline justify-start"
              >
                <Icon name="Key" class="w-4 h-4 mr-2" />
                重置密码
              </button>
              <button
                @click="toggleStatus"
                class="btn btn-outline justify-start"
              >
                <Icon name="ToggleLeft" class="w-4 h-4 mr-2" />
                {{ user.status === 'active' ? '停用' : '激活' }}
              </button>
              <button
                @click="sendEmail"
                class="btn btn-outline justify-start"
              >
                <Icon name="Mail" class="w-4 h-4 mr-2" />
                发送邮件
              </button>
              <button
                @click="viewLogs"
                class="btn btn-outline justify-start"
              >
                <Icon name="FileText" class="w-4 h-4 mr-2" />
                查看日志
              </button>
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
          关闭
        </button>
        <button
          @click="$emit('edit', user)"
          class="btn btn-primary"
        >
          <Icon name="Edit" class="w-4 h-4 mr-2" />
          编辑用户
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'edit'])

// 状态
const stats = ref({
  posts: 0,
  comments: 0,
  mediaFiles: 0,
  views: 0
})

const recentActivities = ref([
  {
    id: 1,
    type: 'login',
    description: '用户登录系统',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    type: 'create',
    description: '创建了文章《示例文章》',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 3,
    type: 'update',
    description: '更新了个人资料',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
])

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await $fetch(`/api/admin/users/${props.user.id}/stats`)
    if (response.success) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('获取用户统计失败:', error)
  }
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

const getActivityColor = (type) => {
  switch (type) {
    case 'login':
      return 'bg-green-500'
    case 'create':
      return 'bg-blue-500'
    case 'update':
      return 'bg-yellow-500'
    case 'delete':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
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

// 权限检查
const hasPermission = (resource, action) => {
  const permissions = {
    admin: {
      content: ['create', 'edit', 'delete', 'publish'],
      users: ['create', 'edit', 'delete', 'manage_roles'],
      settings: ['view', 'edit'],
      media: ['create', 'edit', 'delete', 'view']
    },
    editor: {
      content: ['create', 'edit', 'publish'],
      users: [],
      settings: ['view'],
      media: ['create', 'edit', 'delete', 'view']
    },
    viewer: {
      content: [],
      users: [],
      settings: ['view'],
      media: ['view']
    }
  }

  return permissions[props.user.role]?.[resource]?.includes(action) || false
}

// 快速操作
const resetPassword = () => {
  if (confirm(`确定要重置用户"${props.user.username}"的密码吗？`)) {
    // 实现重置密码逻辑
    alert('密码重置功能开发中...')
  }
}

const toggleStatus = () => {
  const action = props.user.status === 'active' ? '停用' : '激活'
  if (confirm(`确定要${action}用户"${props.user.username}"吗？`)) {
    // 实现切换状态逻辑
    alert('状态切换功能开发中...')
  }
}

const sendEmail = () => {
  // 实现发送邮件逻辑
  alert('邮件发送功能开发中...')
}

const viewLogs = () => {
  // 实现查看日志逻辑
  alert('日志查看功能开发中...')
}

// 页面加载时获取数据
onMounted(() => {
  fetchStats()
})
</script>