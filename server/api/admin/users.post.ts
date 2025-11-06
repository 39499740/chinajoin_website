import prisma from '~/utils/prisma'
import { requireAuth } from '~/utils/auth'
import type { UserFormData, ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户权限
    const user = await requireAuth(event)

    const body = await readBody<UserFormData>(event)
    const { username, email, password, role, avatar } = body

    // 验证必填字段
    if (!username || !email) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '用户名和邮箱不能为空'
      } as ApiResponse
    }

    // 检查用户名和邮箱是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      setResponseStatus(event, 409)
      return {
        success: false,
        error: existingUser.username === username ? '用户名已存在' : '邮箱已存在'
      } as ApiResponse
    }

    // 创建用户数据
    const userData: any = {
      username,
      email,
      role: role || 'admin',
      avatar: avatar || null
    }

    // 如果提供了密码，则加密
    if (password) {
      const bcrypt = await import('bcryptjs')
      userData.password = await bcrypt.hash(password, 10)
    }

    // 创建用户
    const newUser = await prisma.user.create({
      data: userData,
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

    return {
      success: true,
      data: newUser,
      message: '用户创建成功'
    } as ApiResponse
  } catch (error) {
    console.error('创建用户错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '创建用户失败'
    } as ApiResponse
  }
})