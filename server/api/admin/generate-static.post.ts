import fs from 'fs/promises'
import path from 'path'
import { Nitro } from 'nitropack'
import prisma from '~/utils/prisma'
import { requireAuth } from '~/utils/auth'
import type { ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户权限
    const user = await requireAuth(event)

    // 获取已发布的新闻
    const publishedNews = await prisma.news.findMany({
      where: { status: 'published' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        author: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: { publishedAt: 'desc' }
    })

    // 获取分类
    const categories = await prisma.category.findMany({
      where: {},
      include: {
        _count: {
          select: {
            news: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // 获取网站设置
    const settings = await prisma.setting.findMany()
    const settingsMap: Record<string, any> = {}
    for (const setting of settings) {
      switch (setting.type) {
        case 'number':
          settingsMap[setting.key] = Number(setting.value)
          break
        case 'boolean':
          settingsMap[setting.key] = setting.value === 'true'
          break
        case 'json':
          try {
            settingsMap[setting.key] = JSON.parse(setting.value)
          } catch {
            settingsMap[setting.key] = setting.value
          }
          break
        default:
          settingsMap[setting.key] = setting.value
      }
    }

    // 静态文件输出目录
    const outputDir = path.join(process.cwd(), 'dist', 'static')

    // 确保输出目录存在
    await fs.mkdir(outputDir, { recursive: true })

    // 生成首页
    await generateIndexPage(outputDir, {
      news: publishedNews.slice(0, 10),
      categories,
      settings: settingsMap
    })

    // 生成新闻列表页
    await generateNewsListPage(outputDir, {
      news: publishedNews,
      categories,
      settings: settingsMap
    })

    // 生成新闻详情页
    for (const news of publishedNews) {
      await generateNewsDetailPage(outputDir, {
        news,
        categories,
        settings: settingsMap
      })
    }

    // 生成分类页面
    for (const category of categories) {
      const categoryNews = publishedNews.filter(n => n.categoryId === category.id)
      if (categoryNews.length > 0) {
        await generateCategoryPage(outputDir, {
          category,
          news: categoryNews,
          categories,
          settings: settingsMap
        })
      }
    }

    return {
      success: true,
      data: {
        generatedPages: {
          index: 1,
          newsList: 1,
          newsDetails: publishedNews.length,
          categories: categories.filter(c =>
            publishedNews.some(n => n.categoryId === c.id)
          ).length
        }
      },
      message: '静态页面生成成功'
    } as ApiResponse
  } catch (error) {
    console.error('生成静态页面错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '生成静态页面失败'
    } as ApiResponse
  }
})

// 生成首页
async function generateIndexPage(outputDir: string, data: any) {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.settings.site_name || 'ChinaJoin CMS'}</title>
    <meta name="description" content="${data.settings.site_description || ''}">
    <meta name="keywords" content="${data.settings.site_keywords || ''}">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .news-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .news-card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
        .news-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .news-title a { text-decoration: none; color: #333; }
        .news-title a:hover { color: #0066cc; }
        .news-meta { font-size: 14px; color: #666; margin-bottom: 10px; }
        .news-excerpt { color: #555; }
        .category-tag { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1><a href="/" style="text-decoration: none; color: #333;">${data.settings.site_name || 'ChinaJoin CMS'}</a></h1>
            <p>${data.settings.site_description || ''}</p>
        </header>

        <main>
            <h2>最新新闻</h2>
            <div class="news-grid">
                ${data.news.map(news => `
                    <div class="news-card">
                        <div class="news-title">
                            <a href="/news/${news.slug}">${news.title}</a>
                        </div>
                        <div class="news-meta">
                            <span>${new Date(news.publishedAt).toLocaleDateString('zh-CN')}</span>
                            ${news.category ? `<span class="category-tag">${news.category.name}</span>` : ''}
                        </div>
                        <div class="news-excerpt">${news.excerpt}</div>
                    </div>
                `).join('')}
            </div>
        </main>

        <footer class="footer">
            <p>&copy; ${new Date().getFullYear()} ${data.settings.site_name || 'ChinaJoin CMS'}. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
  `

  await fs.writeFile(path.join(outputDir, 'index.html'), html)
}

// 生成新闻详情页
async function generateNewsDetailPage(outputDir: string, data: any) {
  const newsDir = path.join(outputDir, 'news')
  await fs.mkdir(newsDir, { recursive: true })

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.news.title} - ${data.settings.site_name || 'ChinaJoin CMS'}</title>
    <meta name="description" content="${data.news.excerpt || ''}">
    <meta name="keywords" content="${data.news.tags?.join(', ') || ''}">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .news-title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .news-meta { font-size: 14px; color: #666; margin-bottom: 20px; }
        .news-content { font-size: 16px; line-height: 1.8; }
        .news-content h1, .news-content h2, .news-content h3 { margin-top: 30px; margin-bottom: 15px; }
        .news-content p { margin-bottom: 15px; }
        .category-tag { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; }
        .back-link { display: inline-block; margin-bottom: 20px; color: #0066cc; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1><a href="/" style="text-decoration: none; color: #333;">${data.settings.site_name || 'ChinaJoin CMS'}</a></h1>
        </header>

        <main>
            <a href="/" class="back-link">← 返回首页</a>

            <h1 class="news-title">${data.news.title}</h1>
            <div class="news-meta">
                <span>${new Date(data.news.publishedAt).toLocaleDateString('zh-CN')}</span>
                <span>作者: ${data.news.author.username}</span>
                ${data.news.category ? `<span class="category-tag">${data.news.category.name}</span>` : ''}
            </div>

            <div class="news-content">
                ${data.news.content}
            </div>
        </main>

        <footer class="footer">
            <p>&copy; ${new Date().getFullYear()} ${data.settings.site_name || 'ChinaJoin CMS'}. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
  `

  await fs.writeFile(path.join(newsDir, `${data.news.slug}.html`), html)
}

// 生成新闻列表页
async function generateNewsListPage(outputDir: string, data: any) {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>所有新闻 - ${data.settings.site_name || 'ChinaJoin CMS'}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .news-list { }
        .news-item { border-bottom: 1px solid #eee; padding: 20px 0; }
        .news-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
        .news-title a { text-decoration: none; color: #333; }
        .news-title a:hover { color: #0066cc; }
        .news-meta { font-size: 14px; color: #666; margin-bottom: 10px; }
        .news-excerpt { color: #555; }
        .category-tag { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1><a href="/" style="text-decoration: none; color: #333;">${data.settings.site_name || 'ChinaJoin CMS'}</a></h1>
        </header>

        <main>
            <h2>所有新闻</h2>
            <div class="news-list">
                ${data.news.map(news => `
                    <div class="news-item">
                        <div class="news-title">
                            <a href="/news/${news.slug}">${news.title}</a>
                        </div>
                        <div class="news-meta">
                            <span>${new Date(news.publishedAt).toLocaleDateString('zh-CN')}</span>
                            <span>作者: ${news.author.username}</span>
                            ${news.category ? `<span class="category-tag">${news.category.name}</span>` : ''}
                        </div>
                        <div class="news-excerpt">${news.excerpt}</div>
                    </div>
                `).join('')}
            </div>
        </main>

        <footer class="footer">
            <p>&copy; ${new Date().getFullYear()} ${data.settings.site_name || 'ChinaJoin CMS'}. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
  `

  await fs.writeFile(path.join(outputDir, 'news.html'), html)
}

// 生成分类页面
async function generateCategoryPage(outputDir: string, data: any) {
  const categoryDir = path.join(outputDir, 'category')
  await fs.mkdir(categoryDir, { recursive: true })

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.category.name} - ${data.settings.site_name || 'ChinaJoin CMS'}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .category-info { margin-bottom: 30px; }
        .category-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .category-description { color: #666; }
        .news-list { }
        .news-item { border-bottom: 1px solid #eee; padding: 20px 0; }
        .news-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
        .news-title a { text-decoration: none; color: #333; }
        .news-title a:hover { color: #0066cc; }
        .news-meta { font-size: 14px; color: #666; margin-bottom: 10px; }
        .news-excerpt { color: #555; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1><a href="/" style="text-decoration: none; color: #333;">${data.settings.site_name || 'ChinaJoin CMS'}</a></h1>
        </header>

        <main>
            <div class="category-info">
                <h2 class="category-name">${data.category.name}</h2>
                ${data.category.description ? `<p class="category-description">${data.category.description}</p>` : ''}
            </div>

            <div class="news-list">
                ${data.news.map(news => `
                    <div class="news-item">
                        <div class="news-title">
                            <a href="/news/${news.slug}">${news.title}</a>
                        </div>
                        <div class="news-meta">
                            <span>${new Date(news.publishedAt).toLocaleDateString('zh-CN')}</span>
                            <span>作者: ${news.author.username}</span>
                        </div>
                        <div class="news-excerpt">${news.excerpt}</div>
                    </div>
                `).join('')}
            </div>
        </main>

        <footer class="footer">
            <p>&copy; ${new Date().getFullYear()} ${data.settings.site_name || 'ChinaJoin CMS'}. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>
  `

  await fs.writeFile(path.join(categoryDir, `${data.category.slug}.html`), html)
}