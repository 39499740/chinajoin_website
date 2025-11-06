import prisma from '~/utils/prisma'
import { requireAuth } from '~/utils/auth'
import type { NewsFormData, ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户权限
    const user = await requireAuth(event)

    const id = getRouterParam(event, 'id')
    const body = await readBody<NewsFormData>(event)
    const { title, content, excerpt, status, categoryId, featuredImage, tags } = body

    if (!id) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '新闻ID不能为空'
      } as ApiResponse
    }

    // 验证必填字段
    if (!title || !content) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '标题和内容不能为空'
      } as ApiResponse
    }

    // 检查新闻是否存在
    const existingNews = await prisma.news.findUnique({
      where: { id }
    })

    if (!existingNews) {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: '新闻不存在'
      } as ApiResponse
    }

    // 如果标题变更，重新生成 slug
    let slug = existingNews.slug
    if (title !== existingNews.title) {
      slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()

      // 检查新 slug 是否重复
      const duplicateNews = await prisma.news.findFirst({
        where: { slug, id: { not: id } }
      })

      if (duplicateNews) {
        slug = `${slug}-${Date.now()}`
      }
    }

    // 如果内容发生变更，创建历史记录
    if (content !== existingNews.content || title !== existingNews.title) {
      await prisma.newsHistory.create({
        data: {
          newsId: id,
          title: existingNews.title,
          content: existingNews.content,
          authorId: user.id
        }
      })
    }

    // 更新新闻
    const updatedNews = await prisma.news.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        status: status || 'draft',
        categoryId: categoryId || null,
        featuredImage: featuredImage || null,
        tags: tags || [],
        publishedAt: status === 'published' && !existingNews.publishedAt ? new Date() : existingNews.publishedAt
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

    return {
      success: true,
      data: updatedNews,
      message: '新闻更新成功'
    } as ApiResponse
  } catch (error) {
    console.error('更新新闻错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '更新新闻失败'
    } as ApiResponse
  }
})