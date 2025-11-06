// 用户相关类型
export interface User {
  id: string
  username: string
  email: string
  password?: string
  avatar?: string
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  user: Omit<User, 'password'>
  token: string
}

// 新闻相关类型
export interface News {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  status: 'draft' | 'published' | 'archived'
  categoryId?: string
  authorId: string
  featuredImage?: string
  tags?: string[]
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  author?: User
  category?: Category
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  createdAt: Date
  updatedAt: Date
  parent?: Category
  children?: Category[]
}

export interface NewsHistory {
  id: string
  newsId: string
  title: string
  content: string
  authorId: string
  createdAt: Date
  author?: User
}

// 媒体相关类型
export interface Media {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  url: string
  width?: number
  height?: number
  alt?: string
  uploadedBy: string
  createdAt: Date
  uploader?: User
}

// 设置相关类型
export interface Setting {
  id: string
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  createdAt: Date
  updatedAt: Date
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T = any> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
}

// 表单相关类型
export interface NewsFormData {
  title: string
  content: string
  excerpt?: string
  status: 'draft' | 'published'
  categoryId?: string
  featuredImage?: string
  tags?: string[]
}

export interface CategoryFormData {
  name: string
  slug?: string
  description?: string
  parentId?: string
}

export interface UserFormData {
  username: string
  email: string
  password?: string
  avatar?: string
  role: string
}

export interface SettingFormData {
  [key: string]: string | number | boolean
}