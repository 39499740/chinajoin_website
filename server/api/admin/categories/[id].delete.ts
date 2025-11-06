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
        error: '分类ID不能为空'
      } as ApiResponse
    }

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            news: true,
            children: true
          }
        }
      }
    })

    if (!existingCategory) {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: '分类不存在'
      } as ApiResponse
    }

    // 检查是否有子分类
    if (existingCategory._count.children > 0) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '该分类下还有子分类，无法删除'
      } as ApiResponse
    }

    // 检查是否有新闻
    if (existingCategory._count.news > 0) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '该分类下还有新闻，无法删除'
      } as ApiResponse
    }

    // 删除分类
    await prisma.category.delete({
      where: { id }
    })

    return {
      success: true,
      message: '分类删除成功'
    } as ApiResponse
  } catch (error) {
    console.error('删除分类错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '删除分类失败'
    } as ApiResponse
  }
})