import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import prisma from '~/utils/prisma'
import { requireAuth } from '~/utils/auth'
import type { ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户权限
    const user = await requireAuth(event)

    // 处理文件上传
    const formData = await readMultipartFormData(event)
    const file = formData.find(item => item.name === 'file')

    if (!file) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '请选择要上传的文件'
      } as ApiResponse
    }

    // 验证文件大小
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.data.length > maxSize) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '文件大小不能超过10MB'
      } as ApiResponse
    }

    // 验证文件类型
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: '不支持的文件类型'
      } as ApiResponse
    }

    // 生成文件名和路径
    const fileExtension = path.extname(file.filename)
    const uniqueFilename = uuidv4() + fileExtension
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    const filePath = path.join(uploadDir, uniqueFilename)

    // 确保上传目录存在
    await fs.mkdir(uploadDir, { recursive: true })

    let finalFilePath = filePath
    let processedFileData = file.data

    // 如果是图片，进行处理
    if (file.type.startsWith('image/')) {
      try {
        // 使用 Sharp 处理图片
        const image = sharp(file.data)
        const metadata = await image.metadata()

        // 转换为 WebP 格式（如果原图不是 WebP）
        if (file.type !== 'image/webp') {
          const webpBuffer = await image
            .webp({ quality: 80 })
            .toBuffer()

          processedFileData = webpBuffer
          finalFilePath = filePath.replace(fileExtension, '.webp')
          uniqueFilename.replace(fileExtension, '.webp')
        }

        // 获取处理后的图片信息
        const processedMetadata = await sharp(processedFileData).metadata()

        // 保存文件
        await fs.writeFile(finalFilePath, processedFileData)

        // 创建媒体记录
        const media = await prisma.media.create({
          data: {
            filename: path.basename(finalFilePath),
            originalName: file.filename,
            mimeType: 'image/webp',
            size: processedFileData.length,
            path: `/uploads/${path.basename(finalFilePath)}`,
            url: `/uploads/${path.basename(finalFilePath)}`,
            width: processedMetadata.width,
            height: processedMetadata.height,
            uploadedBy: user.id
          },
          include: {
            uploader: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        })

        return {
          success: true,
          data: media,
          message: '文件上传成功'
        } as ApiResponse
      } catch (imageError) {
        console.error('图片处理错误:', imageError)
        // 如果图片处理失败，直接保存原文件
      }
    }

    // 保存非图片文件
    await fs.writeFile(finalFilePath, processedFileData)

    // 创建媒体记录
    const media = await prisma.media.create({
      data: {
        filename: path.basename(finalFilePath),
        originalName: file.filename,
        mimeType: file.type,
        size: processedFileData.length,
        path: `/uploads/${path.basename(finalFilePath)}`,
        url: `/uploads/${path.basename(finalFilePath)}`,
        uploadedBy: user.id
      },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    })

    return {
      success: true,
      data: media,
      message: '文件上传成功'
    } as ApiResponse
  } catch (error) {
    console.error('文件上传错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '文件上传失败'
    } as ApiResponse
  }
})