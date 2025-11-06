import prisma from '~/utils/prisma'
import { requireAuth } from '~/utils/auth'
import type { ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户权限
    const user = await requireAuth(event)

    const id = getRouterParam(event, 'id')

    if (!id) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '新闻ID不能为空'
      } as ApiResponse
    }

    // 获取新闻详情
    const news = await prisma.news.findUnique({
      where: { id },
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

    if (!news) {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: '新闻不存在'
      } as ApiResponse
    }

    return {
      success: true,
      data: news
    } as ApiResponse
  } catch (error) {
    console.error('获取新闻详情错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '获取新闻详情失败'
    } as ApiResponse
  }
})