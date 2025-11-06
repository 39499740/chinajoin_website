import prisma from '~/utils/prisma'
import { requireAuth } from '~/utils/auth'
import type { ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户权限
    const user = await requireAuth(event)

    const body = await readBody(event)
    const settings = body

    // 默认设置配置
    const defaultSettings = {
      site_name: { type: 'string', description: '网站名称' },
      site_description: { type: 'string', description: '网站描述' },
      site_keywords: { type: 'string', description: '网站关键词' },
      posts_per_page: { type: 'number', description: '每页显示文章数量' },
      enable_comments: { type: 'boolean', description: '是否启用评论' },
      maintenance_mode: { type: 'boolean', description: '维护模式' }
    }

    // 更新或创建设置
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      const config = defaultSettings[key] || { type: 'string', description: '' }
      let stringValue: string

      switch (config.type) {
        case 'json':
          stringValue = JSON.stringify(value)
          break
        default:
          stringValue = String(value)
      }

      return prisma.setting.upsert({
        where: { key },
        update: {
          value: stringValue,
          type: config.type
        },
        create: {
          key,
          value: stringValue,
          type: config.type,
          description: config.description
        }
      })
    })

    await Promise.all(updatePromises)

    return {
      success: true,
      message: '设置保存成功'
    } as ApiResponse
  } catch (error) {
    console.error('保存设置错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '保存设置失败'
    } as ApiResponse
  }
})