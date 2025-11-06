import jwt from 'jsonwebtoken'
import prisma from '~/utils/prisma'
import type { ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 从 Cookie 中获取 token
    const token = getCookie(event, 'auth-token')

    if (!token) {
      setResponseStatus(event, 401)
      return {
        success: false,
        error: '未找到认证信息'
      } as ApiResponse
    }

    // 验证 JWT
    const config = useRuntimeConfig()
    const decoded = jwt.verify(token, config.jwtSecret) as any

    if (!decoded.userId) {
      setResponseStatus(event, 401)
      return {
        success: false,
        error: '无效的认证信息'
      } as ApiResponse
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      setResponseStatus(event, 401)
      return {
        success: false,
        error: '用户不存在'
      } as ApiResponse
    }

    return {
      success: true,
      data: { user }
    } as ApiResponse
  } catch (error) {
    console.error('获取用户信息错误:', error)
    setResponseStatus(event, 401)
    return {
      success: false,
      error: '认证信息无效'
    } as ApiResponse
  }
})