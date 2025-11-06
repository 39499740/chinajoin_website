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

    // 获取历史记录
    const history = await prisma.newsHistory.findMany({
      where: { newsId: id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      data: history
    } as ApiResponse
  } catch (error) {
    console.error('获取新闻历史错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '获取新闻历史失败'
    } as ApiResponse
  }
})