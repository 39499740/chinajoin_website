<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">ChinaJoin CMS</h1>
        <p class="mt-2 text-gray-600">内容管理系统登录</p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <!-- 用户名 -->
          <div>
            <label for="username" class="form-label">
              用户名
            </label>
            <input
              id="username"
              v-model="form.username"
              name="username"
              type="text"
              required
              class="form-input"
              placeholder="请输入用户名"
            />
          </div>

          <!-- 密码 -->
          <div>
            <label for="password" class="form-label">
              密码
            </label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              required
              class="form-input"
              placeholder="请输入密码"
            />
          </div>

          <!-- 错误信息 -->
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {{ error }}
          </div>

          <!-- 登录按钮 -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">登录中...</span>
              <span v-else>登录</span>
            </button>
          </div>
        </form>

        <!-- 默认账户信息 -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-800 font-medium mb-2">默认管理员账户：</p>
          <p class="text-sm text-blue-600">用户名: admin</p>
          <p class="text-sm text-blue-600">密码: admin123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

// 设置页面标题
useHead({
  title: '登录 - ChinaJoin CMS'
})

// 使用中间件
definePageMeta({
  middleware: 'auth',
  layout: false
})

const authStore = useAuthStore()
const router = useRouter()

// 表单数据
const form = ref({
  username: '',
  password: ''
})

// 状态
const isLoading = ref(false)
const error = ref('')

// 处理登录
const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    error.value = '请填写用户名和密码'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const result = await authStore.login(form.value.username, form.value.password)

    if (result.success) {
      // 登录成功，重定向到管理后台首页
      await router.push('/admin')
    } else {
      error.value = result.error || '登录失败'
    }
  } catch (err) {
    error.value = err.message || '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 如果已经登录，重定向到管理后台
onMounted(() => {
  if (authStore.isLoggedIn) {
    router.push('/admin')
  }
})
</script>