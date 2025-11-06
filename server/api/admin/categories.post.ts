import prisma from '~/utils/prisma'
import { requireAuth } from '~/utils/auth'
import type { CategoryFormData, ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户权限
    const user = await requireAuth(event)

    const body = await readBody<CategoryFormData>(event)
    const { name, slug, description, parentId } = body

    // 验证必填字段
    if (!name) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '分类名称不能为空'
      } as ApiResponse
    }

    // 生成 slug
    let categorySlug = slug || name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // 检查 slug 是否重复
    const existingCategory = await prisma.category.findFirst({
      where: { slug: categorySlug }
    })

    if (existingCategory) {
      categorySlug = `${categorySlug}-${Date.now()}`
    }

    // 验证父分类是否存在
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId }
      })
      if (!parentCategory) {
        setResponseStatus(event, 400)
        return {
          success: false,
          error: '父分类不存在'
        } as ApiResponse
      }
    }

    // 创建分类
    const category = await prisma.category.create({
      data: {
        name,
        slug: categorySlug,
        description,
        parentId: parentId || null,
        creatorId: user.id
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            id: true,
            username: true
          }
        },
        _count: {
          select: {
            news: true
          }
        }
      }
    })

    return {
      success: true,
      data: category,
      message: '分类创建成功'
    } as ApiResponse
  } catch (error) {
    console.error('创建分类错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '创建分类失败'
    } as ApiResponse
  }
})