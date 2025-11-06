import type { ApiResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // 清除 Cookie
    deleteCookie(event, 'auth-token')

    return {
      success: true,
      message: '退出登录成功'
    } as ApiResponse
  } catch (error) {
    console.error('退出登录错误:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      error: '服务器内部错误'
    } as ApiResponse
  }
})