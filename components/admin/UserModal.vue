<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content max-w-2xl" @click.stop>
      <!-- 模态框头部 -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ user?.id ? '编辑用户' : '新建用户' }}
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="form-label">
              用户名 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.username"
              type="text"
              required
              :disabled="!!user?.id"
              :maxlength="50"
              class="form-input"
              placeholder="请输入用户名"
            />
            <p v-if="user?.id" class="text-xs text-gray-500 mt-1">用户名创建后不可修改</p>
          </div>

          <div>
            <label class="form-label">
              邮箱地址 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="form-input"
              placeholder="请输入邮箱地址"
            />
          </div>
        </div>

        <div v-if="!user?.id" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="form-label">
              密码 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="form-input pr-10"
                placeholder="请输入密码"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon :name="showPassword ? 'EyeOff' : 'Eye'" class="w-4 h-4" />
              </button>
            </div>
            <div class="mt-2">
              <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>密码强度</span>
                <span>{{ getPasswordStrength() }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="getPasswordStrengthClass()"
                  :style="{ width: getPasswordStrengthWidth() + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <div>
            <label class="form-label">
              确认密码 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.confirmPassword"
              type="password"
              required
              class="form-input"
              placeholder="请再次输入密码"
            />
            <p v-if="passwordMismatch" class="text-xs text-red-500 mt-1">两次输入的密码不一致</p>
          </div>
        </div>

        <!-- 个人信息 -->
        <div class="border-t pt-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">个人信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">
                姓氏
              </label>
              <input
                v-model="formData.lastName"
                type="text"
                class="form-input"
                placeholder="请输入姓氏"
              />
            </div>

            <div>
              <label class="form-label">
                名字
              </label>
              <input
                v-model="formData.firstName"
                type="text"
                class="form-input"
                placeholder="请输入名字"
              />
            </div>

            <div>
              <label class="form-label">
                手机号码
              </label>
              <input
                v-model="formData.phone"
                type="tel"
                class="form-input"
                placeholder="请输入手机号码"
              />
            </div>

            <div>
              <label class="form-label">
                头像URL
              </label>
              <input
                v-model="formData.avatar"
                type="url"
                class="form-input"
                placeholder="请输入头像URL"
              />
            </div>
          </div>

          <div>
            <label class="form-label">
              个人简介
            </label>
            <textarea
              v-model="formData.bio"
              rows="3"
              class="form-textarea"
              placeholder="请输入个人简介"
            />
          </div>
        </div>

        <!-- 权限设置 -->
        <div class="border-t pt-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">权限设置</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">
                用户角色 <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.role"
                required
                class="form-select"
              >
                <option value="">请选择角色</option>
                <option value="admin">管理员</option>
                <option value="editor">编辑</option>
                <option value="viewer">查看者</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                {{ getRoleDescription(formData.role) }}
              </p>
            </div>

            <div>
              <label class="form-label">
                账户状态 <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.status"
                required
                class="form-select"
              >
                <option value="active">活跃</option>
                <option value="inactive">未激活</option>
                <option value="suspended">已停用</option>
              </select>
            </div>
          </div>

          <!-- 权限详情 -->
          <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-2">权限详情</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium">内容管理：</span>
                <span class="text-gray-600">{{ getPermissionText('content', formData.role) }}</span>
              </div>
              <div>
                <span class="font-medium">用户管理：</span>
                <span class="text-gray-600">{{ getPermissionText('users', formData.role) }}</span>
              </div>
              <div>
                <span class="font-medium">系统设置：</span>
                <span class="text-gray-600">{{ getPermissionText('settings', formData.role) }}</span>
              </div>
              <div>
                <span class="font-medium">媒体管理：</span>
                <span class="text-gray-600">{{ getPermissionText('media', formData.role) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 通知设置 -->
        <div class="border-t pt-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">通知设置</h3>
          <div class="space-y-3">
            <div class="flex items-center">
              <input
                v-model="formData.emailNotifications"
                type="checkbox"
                id="emailNotifications"
                class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
              />
              <label for="emailNotifications" class="ml-2 text-sm text-gray-700">
                接收邮件通知
              </label>
            </div>

            <div class="flex items-center">
              <input
                v-model="formData.systemNotifications"
                type="checkbox"
                id="systemNotifications"
                class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
              />
              <label for="systemNotifications" class="ml-2 text-sm text-gray-700">
                接收系统通知
              </label>
            </div>

            <div class="flex items-center">
              <input
                v-model="formData.marketingEmails"
                type="checkbox"
                id="marketingEmails"
                class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
              />
              <label for="marketingEmails" class="ml-2 text-sm text-gray-700">
                接收营销邮件
              </label>
            </div>
          </div>
        </div>

        <!-- 安全设置 -->
        <div v-if="user?.id" class="border-t pt-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">安全设置</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">两步验证</p>
                <p class="text-xs text-gray-500">提高账户安全性</p>
              </div>
              <button
                type="button"
                @click="toggle2FA"
                class="btn btn-sm btn-outline"
              >
                {{ formData.twoFactorEnabled ? '已启用' : '启用' }}
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">登录历史</p>
                <p class="text-xs text-gray-500">查看最近的登录记录</p>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-outline"
              >
                查看历史
              </button>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-center justify-between pt-6 border-t">
          <div class="text-sm text-gray-500">
            <span v-if="user?.id">用户ID：{{ user.id }}</span>
            <span v-if="user?.createdAt"> • 注册时间：{{ formatDate(user.createdAt) }}</span>
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
              type="submit"
              :disabled="!isFormValid || saving"
              class="btn btn-primary"
            >
              <span v-if="saving" class="flex items-center">
                <div class="loading-spinner w-4 h-4 mr-2"></div>
                保存中...
              </span>
              <span v-else>
                {{ user?.id ? '更新用户' : '创建用户' }}
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
  user: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['save', 'cancel'])

// 状态
const saving = ref(false)
const showPassword = ref(false)

// 表单数据
const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  lastName: '',
  firstName: '',
  phone: '',
  avatar: '',
  bio: '',
  role: '',
  status: 'active',
  emailNotifications: true,
  systemNotifications: true,
  marketingEmails: false,
  twoFactorEnabled: false
})

// 计算属性
const isFormValid = computed(() => {
  const baseValid = formData.value.username.trim() &&
                   formData.value.email.trim() &&
                   formData.value.role &&
                   formData.value.status

  if (!props.user) {
    // 新用户需要密码
    return baseValid &&
           formData.value.password &&
           formData.value.password === formData.value.confirmPassword
  }

  return baseValid
})

const passwordMismatch = computed(() => {
  return formData.value.password &&
         formData.value.confirmPassword &&
         formData.value.password !== formData.value.confirmPassword
})

// 初始化表单数据
const initFormData = () => {
  if (props.user) {
    formData.value = {
      username: props.user.username || '',
      email: props.user.email || '',
      password: '',
      confirmPassword: '',
      lastName: props.user.lastName || '',
      firstName: props.user.firstName || '',
      phone: props.user.phone || '',
      avatar: props.user.avatar || '',
      bio: props.user.bio || '',
      role: props.user.role || '',
      status: props.user.status || 'active',
      emailNotifications: props.user.emailNotifications !== false,
      systemNotifications: props.user.systemNotifications !== false,
      marketingEmails: props.user.marketingEmails || false,
      twoFactorEnabled: props.user.twoFactorEnabled || false
    }
  } else {
    // 重置为默认值
    formData.value = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      lastName: '',
      firstName: '',
      phone: '',
      avatar: '',
      bio: '',
      role: '',
      status: 'active',
      emailNotifications: true,
      systemNotifications: true,
      marketingEmails: false,
      twoFactorEnabled: false
    }
  }
}

// 密码强度检查
const getPasswordStrength = () => {
  const password = formData.value.password
  if (!password) return '无'

  let strength = 0
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  const levels = ['无', '很弱', '弱', '中等', '强', '很强']
  return levels[strength]
}

const getPasswordStrengthWidth = () => {
  const password = formData.value.password
  if (!password) return 0

  let strength = 0
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  return (strength / 5) * 100
}

const getPasswordStrengthClass = () => {
  const width = getPasswordStrengthWidth()
  if (width <= 20) return 'bg-red-500'
  if (width <= 40) return 'bg-orange-500'
  if (width <= 60) return 'bg-yellow-500'
  if (width <= 80) return 'bg-blue-500'
  return 'bg-green-500'
}

// 角色相关
const getRoleDescription = (role) => {
  switch (role) {
    case 'admin':
      return '拥有系统所有权限，可以管理所有功能和数据'
    case 'editor':
      return '可以创建和编辑内容，管理媒体文件'
    case 'viewer':
      return '只能查看内容，无法进行修改操作'
    default:
      return '请选择用户角色'
  }
}

const getPermissionText = (permission, role) => {
  const permissions = {
    admin: {
      content: '完全权限',
      users: '完全权限',
      settings: '完全权限',
      media: '完全权限'
    },
    editor: {
      content: '创建、编辑、删除',
      users: '仅查看',
      settings: '仅查看',
      media: '完全权限'
    },
    viewer: {
      content: '仅查看',
      users: '仅查看',
      settings: '仅查看',
      media: '仅查看'
    }
  }

  return permissions[role]?.[permission] || '无权限'
}

// 提交表单
const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('请填写所有必填字段')
    return
  }

  if (passwordMismatch.value) {
    alert('两次输入的密码不一致')
    return
  }

  saving.value = true
  try {
    const data = { ...formData.value }

    // 移除确认密码字段
    delete data.confirmPassword

    // 如果是编辑用户且没有修改密码，移除密码字段
    if (props.user && !data.password) {
      delete data.password
    }

    emit('save', data)
  } catch (error) {
    console.error('保存用户失败:', error)
    alert('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

// 切换两步验证
const toggle2FA = () => {
  // 这里可以实现两步验证的设置逻辑
  alert('两步验证功能开发中...')
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
  if (!props.user) {
    return Object.values(formData.value).some(value =>
      value && typeof value === 'string' && value.trim()
    )
  }

  // 比较当前数据和原始数据
  return JSON.stringify(formData.value) !== JSON.stringify({
    username: props.user.username || '',
    email: props.user.email || '',
    password: '',
    confirmPassword: '',
    lastName: props.user.lastName || '',
    firstName: props.user.firstName || '',
    phone: props.user.phone || '',
    avatar: props.user.avatar || '',
    bio: props.user.bio || '',
    role: props.user.role || '',
    status: props.user.status || 'active',
    emailNotifications: props.user.emailNotifications !== false,
    systemNotifications: props.user.systemNotifications !== false,
    marketingEmails: props.user.marketingEmails || false,
    twoFactorEnabled: props.user.twoFactorEnabled || false
  })
}

// 工具函数
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 监听 user 变化
watch(() => props.user, () => {
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