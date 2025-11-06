import prisma from '~/utils/prisma'
import { requireAuth } from '~/utils/auth'
import type { CategoryFormData, ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户权限
    const user = await requireAuth(event)

    const id = getRouterParam(event, 'id')
    const body = await readBody<CategoryFormData>(event)
    const { name, slug, description, parentId } = body

    if (!id) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '分类ID不能为空'
      } as ApiResponse
    }

    // 验证必填字段
    if (!name) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '分类名称不能为空'
      } as ApiResponse
    }

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: '分类不存在'
      } as ApiResponse
    }

    // 验证不能将自己设为父分类
    if (parentId === id) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '不能将自己设为父分类'
      } as ApiResponse
    }

    // 生成 slug
    let categorySlug = slug || name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // 如果标题变更或未提供 slug，检查新 slug 是否重复
    if (slug !== existingCategory.slug || !slug) {
      const duplicateCategory = await prisma.category.findFirst({
        where: { slug: categorySlug, id: { not: id } }
      })

      if (duplicateCategory) {
        categorySlug = `${categorySlug}-${Date.now()}`
      }
    }

    // 验证父分类是否存在
    if (parentId && parentId !== existingCategory.parentId) {
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

    // 更新分类
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: categorySlug,
        description,
        parentId: parentId || null
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
      data: updatedCategory,
      message: '分类更新成功'
    } as ApiResponse
  } catch (error) {
    console.error('更新分类错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '更新分类失败'
    } as ApiResponse
  }
})