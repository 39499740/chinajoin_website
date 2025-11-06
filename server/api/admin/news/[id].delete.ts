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

    // 删除新闻（级联删除历史记录）
    await prisma.news.delete({
      where: { id }
    })

    return {
      success: true,
      message: '新闻删除成功'
    } as ApiResponse
  } catch (error) {
    console.error('删除新闻错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '删除新闻失败'
    } as ApiResponse
  }
})