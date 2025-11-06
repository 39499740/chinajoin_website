import jwt from 'jsonwebtoken'
import type { User } from '~/types'

export interface JWTPayload {
  userId: string
  username: string
  role: string
  iat?: number
  exp?: number
}

export async function getUserFromToken(event: any): Promise<User | null> {
  try {
    const token = getCookie(event, 'auth-token')

    if (!token) {
      return null
    }

    const config = useRuntimeConfig()
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload

    if (!decoded.userId) {
      return null
    }

    const prisma = await import('~/utils/prisma').then(m => m.default)
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

    return user
  } catch (error) {
    console.error('验证 token 错误:', error)
    return null
  }
}

export function generateToken(user: User): string {
  const config = useRuntimeConfig()
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  )
}

export async function requireAuth(event: any): Promise<User> {
  const user = await getUserFromToken(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: '请先登录'
    })
  }

  return user
}