import prisma from '~/utils/prisma'
import { requireAuth } from '~/utils/auth'
import type { ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户权限
    const user = await requireAuth(event)

    // 获取查询参数
    const query = getQuery(event)
    const { search = '' } = query

    // 构建查询条件
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    // 获取分类列表（树形结构）
    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        creator: {
          select: {
            id: true,
            username: true
          }
        },
        _count: {
          select: {
            news: true
          }
        }
      }
    })

    // 构建树形结构
    const buildTree = (items: any[], parentId: string | null = null): any[] => {
      return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }))
    }

    const treeCategories = buildTree(categories)

    return {
      success: true,
      data: treeCategories
    } as ApiResponse
  } catch (error) {
    console.error('获取分类列表错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '获取分类列表失败'
    } as ApiResponse
  }
})