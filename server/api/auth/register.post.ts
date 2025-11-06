import prisma from '~/utils/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { RegisterRequest, AuthResponse, ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<RegisterRequest>(event)
    const { username, email, password } = body

    // 验证输入
    if (!username || !email || !password) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '用户名、邮箱和密码不能为空'
      } as ApiResponse
    }

    // 密码长度验证
    if (password.length < 6) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '密码长度至少6位'
      } as ApiResponse
    }

    // 检查用户名是否已存在
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

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'admin' // 默认都是管理员
      },
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

    // 生成 JWT
    const config = useRuntimeConfig()
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    )

    // 设置 HttpOnly Cookie
    setCookie(event, 'auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7天
    })

    return {
      success: true,
      data: {
        user,
        token
      }
    } as ApiResponse<AuthResponse>
  } catch (error) {
    console.error('注册错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '服务器内部错误'
    } as ApiResponse
  }
})