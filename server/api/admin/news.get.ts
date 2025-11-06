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
      limit = 10,
      search = '',
      status = '',
      categoryId = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    // 构建查询条件
    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
        { excerpt: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    // 构建排序条件
    const orderBy: any = {}
    orderBy[sortBy as string] = sortOrder

    // 并行获取数据和总数
    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        skip,
        take,
        orderBy,
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
      }),
      prisma.news.count({ where })
    ])

    const totalPages = Math.ceil(total / take)

    return {
      success: true,
      data: news,
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages
      }
    } as PaginatedResponse
  } catch (error) {
    console.error('获取新闻列表错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '获取新闻列表失败'
    } as ApiResponse
  }
})