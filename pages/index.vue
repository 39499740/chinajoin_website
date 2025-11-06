<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">ChinaJoin CMS</h1>
      <p class="text-xl text-gray-600 mb-8">内容管理系统</p>
      <div class="space-x-4">
        <NuxtLink
          to="/admin/login"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          进入管理后台
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'ChinaJoin CMS - 内容管理系统'
})
</script>