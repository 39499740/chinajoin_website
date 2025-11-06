import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始数据库种子数据填充...')

  // 创建默认管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@chinajoin.com',
      password: hashedPassword,
      role: 'admin',
    },
  })

  console.log('✓ 默认管理员用户创建成功:', adminUser.username)

  // 创建默认新闻分类
  const categories = [
    { name: '公司新闻', slug: 'company-news', description: '公司相关的新闻动态' },
    { name: '行业资讯', slug: 'industry-info', description: '行业相关的资讯信息' },
    { name: '产品发布', slug: 'product-release', description: '产品发布相关新闻' },
    { name: '通知公告', slug: 'announcements', description: '公司通知公告' },
  ]

  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: {
        ...categoryData,
        creatorId: adminUser.id,
      },
    })
    console.log('✓ 分类创建成功:', category.name)
  }

  // 创建默认网站设置
  const defaultSettings = [
    { key: 'site_name', value: 'ChinaJoin CMS', type: 'string', description: '网站名称' },
    { key: 'site_description', value: 'ChinaJoin 内容管理系统', type: 'string', description: '网站描述' },
    { key: 'site_keywords', value: 'CMS,内容管理,ChinaJoin', type: 'string', description: '网站关键词' },
    { key: 'posts_per_page', value: '10', type: 'number', description: '每页显示文章数量' },
    { key: 'enable_comments', value: 'false', type: 'boolean', description: '是否启用评论' },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', description: '维护模式' },
  ]

  for (const settingData of defaultSettings) {
    const setting = await prisma.setting.upsert({
      where: { key: settingData.key },
      update: {},
      create: settingData,
    })
    console.log('✓ 设置创建成功:', setting.key)
  }

  console.log('🎉 数据库种子数据填充完成!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ 种子数据填充失败:', e)
    await prisma.$disconnect()
    process.exit(1)
  })