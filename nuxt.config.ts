export default defineNuxtConfig({
  // Devtools
  devtools: { enabled: true },

  // CSS
  css: ['~/assets/css/main.css'],

  // Modules
  modules: [
    // '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@pinia/nuxt',
    'nuxt-auth-utils'
  ],

  // Runtime config
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    databaseUrl: process.env.DATABASE_URL,
    public: {
      apiBase: process.env.API_BASE || '/api'
    }
  },

  // Nitro configuration
  nitro: {
    experimental: {
      wasm: true
    },
    hooks: {
      'prerender:routes': async (ctx) => {
        // 动态添加需要预渲染的路由
        console.log('Prerendering routes:', ctx.routes)
      },
      'prerender:generate': (route) => {
        // 跳过管理后台的预渲染
        if (route.route?.includes('/admin')) {
          route.skip = true
        }
      }
    }
  },

  // Page routing
  pages: true,

  // App config
  app: {
    head: {
      title: 'ChinaJoin CMS',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'ChinaJoin 内容管理系统' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // TypeScript
  typescript: {
    strict: false,
    typeCheck: false
  },

  // Compatibility mode
  compatibility: {
    vue: {
      runtimeCompiler: true
    }
  },

  // Image optimization
  image: {
    format: ['webp'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  }
})