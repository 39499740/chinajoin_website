import prisma from '~/utils/prisma'
import { requireAuth } from '~/utils/auth'
import type { ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户权限
    const user = await requireAuth(event)

    // 并行获取统计数据
    const [newsCount, categoryCount, mediaCount, userCount] = await Promise.all([
      prisma.news.count(),
      prisma.category.count(),
      prisma.media.count(),
      prisma.user.count()
    ])

    return {
      success: true,
      data: {
        newsCount,
        categoryCount,
        mediaCount,
        userCount
      }
    } as ApiResponse
  } catch (error) {
    console.error('获取统计数据错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '获取统计数据失败'
    } as ApiResponse
  }
})