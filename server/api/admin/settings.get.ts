import prisma from '~/utils/prisma'
import { requireAuth } from '~/utils/auth'
import type { ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户权限
    const user = await requireAuth(event)

    // 获取所有设置
    const settings = await prisma.setting.findMany({
      orderBy: { key: 'asc' }
    })

    // 转换为键值对格式
    const settingsMap: Record<string, any> = {}
    for (const setting of settings) {
      switch (setting.type) {
        case 'number':
          settingsMap[setting.key] = Number(setting.value)
          break
        case 'boolean':
          settingsMap[setting.key] = setting.value === 'true'
          break
        case 'json':
          try {
            settingsMap[setting.key] = JSON.parse(setting.value)
          } catch {
            settingsMap[setting.key] = setting.value
          }
          break
        default:
          settingsMap[setting.key] = setting.value
      }
    }

    return {
      success: true,
      data: settingsMap
    } as ApiResponse
  } catch (error) {
    console.error('获取设置错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '获取设置失败'
    } as ApiResponse
  }
})