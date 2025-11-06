import fs from 'fs/promises'
import path from 'path'
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
        error: '媒体ID不能为空'
      } as ApiResponse
    }

    // 检查媒体是否存在
    const media = await prisma.media.findUnique({
      where: { id }
    })

    if (!media) {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: '媒体文件不存在'
      } as ApiResponse
    }

    // 删除物理文件
    try {
      const filePath = path.join(process.cwd(), 'public', media.path)
      await fs.unlink(filePath)
    } catch (fileError) {
      console.error('删除物理文件失败:', fileError)
      // 继续删除数据库记录，即使物理文件删除失败
    }

    // 删除数据库记录
    await prisma.media.delete({
      where: { id }
    })

    return {
      success: true,
      message: '媒体文件删除成功'
    } as ApiResponse
  } catch (error) {
    console.error('删除媒体文件错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '删除媒体文件失败'
    } as ApiResponse
  }
})