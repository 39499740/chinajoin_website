<template>
  <div>
    <!-- 页面头部 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">网站设置</h1>
        <p class="text-gray-600 mt-1">配置网站基本信息、SEO设置和系统参数</p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="exportSettings"
          class="btn btn-outline"
        >
          <Icon name="Download" class="w-4 h-4 mr-2" />
          导出配置
        </button>
        <button
          @click="saveAllSettings"
          :disabled="saving"
          class="btn btn-primary"
        >
          <span v-if="saving" class="flex items-center">
            <div class="loading-spinner w-4 h-4 mr-2"></div>
            保存中...
          </span>
          <span v-else>
            <Icon name="Save" class="w-4 h-4 mr-2" />
            保存所有设置
          </span>
        </button>
      </div>
    </div>

    <!-- 设置选项卡 -->
    <div class="card mb-6">
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8 px-6" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.id
                ? 'border-primary-color text-primary-color'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <Icon :name="tab.icon" class="w-4 h-4 mr-2" />
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </div>

    <!-- 设置内容 -->
    <div class="space-y-6">
      <!-- 基本设置 -->
      <div v-if="activeTab === 'basic'" class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-6">基本设置</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">网站名称</label>
              <input
                v-model="settings.siteName"
                type="text"
                class="form-input"
                placeholder="请输入网站名称"
              />
              <p class="text-xs text-gray-500 mt-1">显示在网站标题和页面头部</p>
            </div>

            <div>
              <label class="form-label">网站副标题</label>
              <input
                v-model="settings.siteTagline"
                type="text"
                class="form-input"
                placeholder="请输入网站副标题"
              />
            </div>

            <div>
              <label class="form-label">网站描述</label>
              <textarea
                v-model="settings.siteDescription"
                rows="3"
                class="form-textarea"
                placeholder="请输入网站描述"
              />
              <p class="text-xs text-gray-500 mt-1">用于SEO和搜索引擎展示</p>
            </div>

            <div>
              <label class="form-label">网站关键词</label>
              <input
                v-model="settings.siteKeywords"
                type="text"
                class="form-input"
                placeholder="请输入关键词，用逗号分隔"
              />
            </div>

            <div>
              <label class="form-label">网站URL</label>
              <input
                v-model="settings.siteUrl"
                type="url"
                class="form-input"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label class="form-label">联系邮箱</label>
              <input
                v-model="settings.contactEmail"
                type="email"
                class="form-input"
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <label class="form-label">联系电话</label>
              <input
                v-model="settings.contactPhone"
                type="tel"
                class="form-input"
                placeholder="+86 123 4567 8900"
              />
            </div>

            <div>
              <label class="form-label">公司地址</label>
              <input
                v-model="settings.companyAddress"
                type="text"
                class="form-input"
                placeholder="请输入公司地址"
              />
            </div>
          </div>

          <div class="mt-6">
            <label class="form-label">网站Logo</label>
            <div class="flex items-center space-x-4">
              <div class="w-32 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <img
                  v-if="settings.siteLogo"
                  :src="settings.siteLogo"
                  alt="网站Logo"
                  class="max-w-full max-h-full object-contain"
                />
                <Icon v-else name="Image" class="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <button
                  @click="uploadLogo"
                  class="btn btn-outline btn-sm mb-2"
                >
                  <Icon name="Upload" class="w-4 h-4 mr-2" />
                  上传Logo
                </button>
                <br>
                <button
                  v-if="settings.siteLogo"
                  @click="removeLogo"
                  class="btn btn-sm btn-danger"
                >
                  移除Logo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SEO设置 -->
      <div v-if="activeTab === 'seo'" class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-6">SEO设置</h3>

          <div class="space-y-6">
            <div>
              <label class="form-label">默认标题模板</label>
              <input
                v-model="settings.seoTitleTemplate"
                type="text"
                class="form-input"
                placeholder="%title% - %sitename%"
              />
              <p class="text-xs text-gray-500 mt-1">
                可用变量：%title%（页面标题）, %sitename%（网站名称）, %category%（分类名称）
              </p>
            </div>

            <div>
              <label class="form-label">默认描述模板</label>
              <textarea
                v-model="settings.seoDescriptionTemplate"
                rows="3"
                class="form-textarea"
                placeholder="请输入默认描述模板"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="form-label">Google Analytics ID</label>
                <input
                  v-model="settings.googleAnalyticsId"
                  type="text"
                  class="form-input"
                  placeholder="GA-XXXXXXXXX"
                />
              </div>

              <div>
                <label class="form-label">Google Search Console ID</label>
                <input
                  v-model="settings.googleSiteVerification"
                  type="text"
                  class="form-input"
                  placeholder="验证代码"
                />
              </div>

              <div>
                <label class="form-label">Bing Webmaster Tools ID</label>
                <input
                  v-model="settings.bingSiteVerification"
                  type="text"
                  class="form-input"
                  placeholder="验证代码"
                />
              </div>

              <div>
                <label class="form-label">百度统计ID</label>
                <input
                  v-model="settings.baiduAnalyticsId"
                  type="text"
                  class="form-input"
                  placeholder="统计代码"
                />
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">结构化数据</h4>
              <div class="space-y-3">
                <div class="flex items-center">
                  <input
                    v-model="settings.enableOrganizationSchema"
                    type="checkbox"
                    id="enableOrganizationSchema"
                    class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                  />
                  <label for="enableOrganizationSchema" class="ml-2 text-sm text-gray-700">
                    启用组织结构化数据
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="settings.enableArticleSchema"
                    type="checkbox"
                    id="enableArticleSchema"
                    class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                  />
                  <label for="enableArticleSchema" class="ml-2 text-sm text-gray-700">
                    启用文章结构化数据
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="settings.enableBreadcrumbSchema"
                    type="checkbox"
                    id="enableBreadcrumbSchema"
                    class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                  />
                  <label for="enableBreadcrumbSchema" class="ml-2 text-sm text-gray-700">
                    启用面包屑结构化数据
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容设置 -->
      <div v-if="activeTab === 'content'" class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-6">内容设置</h3>

          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="form-label">每页显示文章数</label>
                <input
                  v-model.number="settings.postsPerPage"
                  type="number"
                  min="5"
                  max="100"
                  class="form-input"
                />
              </div>

              <div>
                <label class="form-label">摘要长度（字符）</label>
                <input
                  v-model.number="settings.excerptLength"
                  type="number"
                  min="50"
                  max="500"
                  class="form-input"
                />
              </div>

              <div>
                <label class="form-label">阅读速度（字/分钟）</label>
                <input
                  v-model.number="settings.readingSpeed"
                  type="number"
                  min="100"
                  max="1000"
                  class="form-input"
                />
              </div>

              <div>
                <label class="form-label">相关文章数量</label>
                <input
                  v-model.number="settings.relatedPostsCount"
                  type="number"
                  min="0"
                  max="20"
                  class="form-input"
                />
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">评论设置</h4>
              <div class="space-y-3">
                <div class="flex items-center">
                  <input
                    v-model="settings.enableComments"
                    type="checkbox"
                    id="enableComments"
                    class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                  />
                  <label for="enableComments" class="ml-2 text-sm text-gray-700">
                    启用评论功能
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="settings.requireCommentApproval"
                    type="checkbox"
                    id="requireCommentApproval"
                    class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                  />
                  <label for="requireCommentApproval" class="ml-2 text-sm text-gray-700">
                    评论需要审核
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="settings.enableCommentReplies"
                    type="checkbox"
                    id="enableCommentReplies"
                    class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                  />
                  <label for="enableCommentReplies" class="ml-2 text-sm text-gray-700">
                    启用评论回复
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">社交媒体分享</h4>
              <div class="space-y-3">
                <div class="flex items-center">
                  <input
                    v-model="settings.enableSocialShare"
                    type="checkbox"
                    id="enableSocialShare"
                    class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                  />
                  <label for="enableSocialShare" class="ml-2 text-sm text-gray-700">
                    启用社交媒体分享
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="settings.enableWechatShare"
                    type="checkbox"
                    id="enableWechatShare"
                    class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                  />
                  <label for="enableWechatShare" class="ml-2 text-sm text-gray-700">
                    启用微信分享
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="settings.enableWeiboShare"
                    type="checkbox"
                    id="enableWeiboShare"
                    class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                  />
                  <label for="enableWeiboShare" class="ml-2 text-sm text-gray-700">
                    启用微博分享
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统设置 -->
      <div v-if="activeTab === 'system'" class="card">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-6">系统设置</h3>

          <div class="space-y-6">
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">维护模式</h4>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-700">启用维护模式将阻止普通用户访问网站</p>
                  <p class="text-xs text-gray-500 mt-1">管理员用户仍然可以访问</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="settings.maintenanceMode"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-color rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-color"></div>
                </label>
              </div>
              <div v-if="settings.maintenanceMode" class="mt-3">
                <label class="form-label">维护页面消息</label>
                <textarea
                  v-model="settings.maintenanceMessage"
                  rows="3"
                  class="form-textarea"
                  placeholder="网站正在维护中，请稍后再试..."
                />
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">缓存设置</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label">页面缓存时间（分钟）</label>
                  <input
                    v-model.number="settings.cacheTime"
                    type="number"
                    min="0"
                    max="1440"
                    class="form-input"
                  />
                </div>

                <div>
                  <label class="form-label">静态资源缓存时间（天）</label>
                  <input
                    v-model.number="settings.staticCacheTime"
                    type="number"
                    min="0"
                    max="365"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">安全设置</h4>
              <div class="space-y-3">
                <div class="flex items-center">
                  <input
                    v-model="settings.enableCaptcha"
                    type="checkbox"
                    id="enableCaptcha"
                    class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                  />
                  <label for="enableCaptcha" class="ml-2 text-sm text-gray-700">
                    启用验证码
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="settings.enableRateLimit"
                    type="checkbox"
                    id="enableRateLimit"
                    class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                  />
                  <label for="enableRateLimit" class="ml-2 text-sm text-gray-700">
                    启用请求频率限制
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="settings.enableSecurityHeaders"
                    type="checkbox"
                    id="enableSecurityHeaders"
                    class="rounded border-gray-300 text-primary-color focus:ring-primary-color"
                  />
                  <label for="enableSecurityHeaders" class="ml-2 text-sm text-gray-700">
                    启用安全响应头
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">邮件设置</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label">SMTP服务器</label>
                  <input
                    v-model="settings.smtpHost"
                    type="text"
                    class="form-input"
                    placeholder="smtp.example.com"
                  />
                </div>

                <div>
                  <label class="form-label">SMTP端口</label>
                  <input
                    v-model.number="settings.smtpPort"
                    type="number"
                    class="form-input"
                    placeholder="587"
                  />
                </div>

                <div>
                  <label class="form-label">SMTP用户名</label>
                  <input
                    v-model="settings.smtpUsername"
                    type="text"
                    class="form-input"
                    placeholder="username@example.com"
                  />
                </div>

                <div>
                  <label class="form-label">SMTP密码</label>
                  <input
                    v-model="settings.smtpPassword"
                    type="password"
                    class="form-input"
                    placeholder="•••••••••"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

// 设置页面标题
useHead({
  title: '网站设置 - ChinaJoin CMS'
})

// 使用中间件
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()

// 状态
const saving = ref(false)
const activeTab = ref('basic')

// 设置选项卡
const tabs = [
  { id: 'basic', name: '基本设置', icon: 'Settings' },
  { id: 'seo', name: 'SEO设置', icon: 'Search' },
  { id: 'content', name: '内容设置', icon: 'FileText' },
  { id: 'system', name: '系统设置', icon: 'Server' }
]

// 设置数据
const settings = ref({
  // 基本设置
  siteName: '',
  siteTagline: '',
  siteDescription: '',
  siteKeywords: '',
  siteUrl: '',
  contactEmail: '',
  contactPhone: '',
  companyAddress: '',
  siteLogo: '',

  // SEO设置
  seoTitleTemplate: '%title% - %sitename%',
  seoDescriptionTemplate: '',
  googleAnalyticsId: '',
  googleSiteVerification: '',
  bingSiteVerification: '',
  baiduAnalyticsId: '',
  enableOrganizationSchema: true,
  enableArticleSchema: true,
  enableBreadcrumbSchema: true,

  // 内容设置
  postsPerPage: 10,
  excerptLength: 200,
  readingSpeed: 300,
  relatedPostsCount: 4,
  enableComments: true,
  requireCommentApproval: false,
  enableCommentReplies: true,
  enableSocialShare: true,
  enableWechatShare: true,
  enableWeiboShare: true,

  // 系统设置
  maintenanceMode: false,
  maintenanceMessage: '网站正在维护中，请稍后再试...',
  cacheTime: 60,
  staticCacheTime: 30,
  enableCaptcha: false,
  enableRateLimit: true,
  enableSecurityHeaders: true,
  smtpHost: '',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: ''
})

// 获取设置
const fetchSettings = async () => {
  try {
    const response = await $fetch('/api/admin/settings')
    if (response.success) {
      settings.value = { ...settings.value, ...response.data }
    }
  } catch (error) {
    console.error('获取设置失败:', error)
  }
}

// 保存所有设置
const saveAllSettings = async () => {
  saving.value = true
  try {
    const response = await $fetch('/api/admin/settings', {
      method: 'POST',
      body: settings.value
    })

    if (response.success) {
      alert('设置保存成功')
    } else {
      alert(response.error || '保存失败')
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    alert('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

// 上传Logo
const uploadLogo = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await $fetch('/api/admin/upload', {
          method: 'POST',
          body: formData
        })

        if (response.success) {
          settings.value.siteLogo = response.data.url
        }
      } catch (error) {
        console.error('上传Logo失败:', error)
        alert('上传失败，请稍后重试')
      }
    }
  }
  input.click()
}

// 移除Logo
const removeLogo = () => {
  settings.value.siteLogo = ''
}

// 导出设置
const exportSettings = () => {
  const dataStr = JSON.stringify(settings.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `settings-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 页面加载时获取设置
onMounted(() => {
  fetchSettings()
})
</script>