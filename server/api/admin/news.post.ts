import prisma from '~/utils/prisma'
import { requireAuth } from '~/utils/auth'
import type { NewsFormData, ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户权限
    const user = await requireAuth(event)

    const body = await readBody<NewsFormData>(event)
    const { title, content, excerpt, status, categoryId, featuredImage, tags } = body

    // 验证必填字段
    if (!title || !content) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '标题和内容不能为空'
      } as ApiResponse
    }

    // 生成 slug
    let slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // 检查 slug 是否重复，如果重复则添加时间戳
    const existingNews = await prisma.news.findFirst({
      where: { slug }
    })

    if (existingNews) {
      slug = `${slug}-${Date.now()}`
    }

    // 创建新闻
    const news = await prisma.news.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        status: status || 'draft',
        categoryId: categoryId || null,
        authorId: user.id,
        featuredImage: featuredImage || null,
        tags: tags || [],
        publishedAt: status === 'published' ? new Date() : null
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    // 创建历史记录
    await prisma.newsHistory.create({
      data: {
        newsId: news.id,
        title: news.title,
        content: news.content,
        authorId: user.id
      }
    })

    return {
      success: true,
      data: news,
      message: '新闻创建成功'
    } as ApiResponse
  } catch (error) {
    console.error('创建新闻错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '创建新闻失败'
    } as ApiResponse
  }
})