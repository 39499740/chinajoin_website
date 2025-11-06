import prisma from '~/utils/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { LoginRequest, AuthResponse, ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<LoginRequest>(event)
    const { username, password } = body

    // 验证输入
    if (!username || !password) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '用户名和密码不能为空'
      } as ApiResponse
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
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
        error: '用户名或密码错误'
      } as ApiResponse
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      setResponseStatus(event, 401)
      return {
        success: false,
        error: '用户名或密码错误'
      } as ApiResponse
    }

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

    // 移除密码字段
    const { password: _, ...userWithoutPassword } = user

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
        user: userWithoutPassword,
        token
      }
    } as ApiResponse<AuthResponse>
  } catch (error) {
    console.error('登录错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '服务器内部错误'
    } as ApiResponse
  }
})