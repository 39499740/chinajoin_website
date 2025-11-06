import prisma from '~/utils/prisma'
import { requireAuth } from '~/utils/auth'
import type { ApiResponse, PaginatedResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户权限
    const user = await requireAuth(event)

    // 获取查询参数
    const query = getQuery(event)
    const {
      page = 1,
      limit = 20,
      search = '',
      type = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    // 构建查询条件
    const where: any = {}

    if (search) {
      where.OR = [
        { originalName: { contains: search as string, mode: 'insensitive' } },
        { filename: { contains: search as string, mode: 'insensitive' } },
        { alt: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    if (type) {
      if (type === 'image') {
        where.mimeType = { startsWith: 'image/' }
      } else {
        where.mimeType = type
      }
    }

    // 构建排序条件
    const orderBy: any = {}
    orderBy[sortBy as string] = sortOrder

    // 并行获取数据和总数
    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          uploader: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      }),
      prisma.media.count({ where })
    ])

    const totalPages = Math.ceil(total / take)

    return {
      success: true,
      data: media,
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages
      }
    } as PaginatedResponse
  } catch (error) {
    console.error('获取媒体列表错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '获取媒体列表失败'
    } as ApiResponse
  }
})