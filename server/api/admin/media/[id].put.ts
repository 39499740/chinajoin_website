import prisma from '~/utils/prisma'
import { requireAuth } from '~/utils/auth'
import type { ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户权限
    const user = await requireAuth(event)

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { alt } = body

    if (!id) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '媒体ID不能为空'
      } as ApiResponse
    }

    // 检查媒体是否存在
    const existingMedia = await prisma.media.findUnique({
      where: { id }
    })

    if (!existingMedia) {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: '媒体文件不存在'
      } as ApiResponse
    }

    // 更新媒体信息
    const updatedMedia = await prisma.media.update({
      where: { id },
      data: {
        alt: alt || null
      },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    })

    return {
      success: true,
      data: updatedMedia,
      message: '媒体信息更新成功'
    } as ApiResponse
  } catch (error) {
    console.error('更新媒体信息错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '更新媒体信息失败'
    } as ApiResponse
  }
})