---
mode: agent
---
---
title: ChatWithYou
categories:
  - null
description: ChatWithYou 的开发文档
date: 2025-09-22 17:17:55
tags:
  - ChatWithYou
---
# 开发文档

## 需求

就像一个《哆啦A梦》中的道具「仿真电话亭」：  
**效果**：  
使用者可以输入任何真实或虚构的电话号码（甚至包括历史人物、虚构角色），电话亭会模拟出与对方通话的效果。对方的反应和语气会与真人完全一致，仿佛真的在对话。
**原理**：  
通过未来科技模拟出对方的性格、声音和可能的回答，实现逼真的互动体验。

我的 ChatWithYou：  
**目标**：  
- 制作一个用来对话的 ai 智能体，这个 ai 智能体应该模拟甚至成为一个特殊具体的人（eg：鲁迅、李维刚。。）
- 即用户能够和自己想要的人对话，并且 ai 智能体能够真实的模拟模仿之人的思维、语法。
**效果**：  
使用者可以选择任何真实或虚构的人物（甚至包括历史人物、虚构角色），ai 智能体会模拟出与对方通话的效果。对方的反应和语气会与真人完全一致（只有语言），仿佛真的在对话。
**原理**：  
通过大语言模型模拟出对方的性格和可能的回答，实现逼真的互动体验。  
应该需要足够的相关人物的数据。

## 技术方案

### 技术栈选择（Nuxt.js 全栈方案）

**全栈框架（2天）**：
- **Nuxt.js 3** + TypeScript - 全栈Vue框架，SSR/SPA支持
- **Nuxt UI** 或 **Element Plus** - 现代化UI组件库
- **Nitro引擎** - 内置服务端引擎，无需单独后端
- **WebSocket/Socket.io** - 实时对话通信

**数据存储（1天）**：
- **MongoDB** + **Mongoose** - 生产级数据库
- **Prisma** (可选) - 现代化ORM，类型安全
- **Redis** (可选) - 会话缓存和限流

**AI集成（1天）**：
- **OpenAI GPT-4 API** 或 **Claude API** - 成熟的对话能力
- **LangChain.js** (可选) - AI应用开发框架
- **自定义Prompt工程** - 人物角色扮演

**认证与安全（1天）**：
- **Nuxt Auth** - 内置认证解决方案
- **JWT** - 无状态身份验证
- **Rate Limiting** - API限流保护

**部署（2天）**：
- **Vercel** - 一键部署Nuxt.js应用
- **MongoDB Atlas** - 云数据库
- **Cloudflare** (可选) - CDN和安全防护

### Nuxt.js 优势分析

1. **开发效率提升**：
   - 全栈开发，前后端统一
   - 内置API路由，无需单独后端服务
   - 自动代码分割和优化
   - 热重载和开发者体验优秀

2. **SEO和性能**：
   - 服务端渲染(SSR)支持
   - 自动生成sitemap和meta标签
   - 图片优化和懒加载
   - 渐进式Web应用(PWA)支持

3. **部署简单**：
   - Vercel一键部署
   - 自动CI/CD集成
   - 边缘函数支持
   - 全球CDN分发

### 系统架构设计（Nuxt.js 架构）

```
┌─────────────────────────────────────────┐
│               Nuxt.js 应用                │
├─────────────────────────────────────────┤
│  客户端 (SPA/SSR)                        │
│  ├── pages/                             │
│  │   ├── index.vue (人物选择页)          │
│  │   ├── chat/[id].vue (对话页面)        │
│  │   └── history.vue (历史记录)          │
│  ├── components/                        │
│  │   ├── CharacterSelector.vue          │
│  │   ├── ChatInterface.vue              │
│  │   └── MessageBubble.vue              │
│  └── composables/                       │
│      ├── useChat.ts                     │
│      ├── useCharacters.ts               │
│      └── useWebSocket.ts                │
├─────────────────────────────────────────┤
│  服务端 (Nitro API)                      │
│  ├── server/api/                        │
│  │   ├── characters/                    │
│  │   ├── conversations/                 │
│  │   └── ai/                            │
│  ├── server/middleware/                 │
│  │   ├── auth.ts                        │
│  │   └── rateLimit.ts                   │
│  └── server/plugins/                    │
│      ├── mongodb.ts                     │
│      └── socketio.ts                    │
└─────────────────────────────────────────┘
│
├── 外部服务
│   ├── MongoDB Atlas (数据存储)
│   ├── OpenAI API (AI对话)
│   └── Redis (可选缓存)
```

### 核心功能模块

1. **人物管理系统**
   - 预设经典人物（鲁迅、孔子、爱因斯坦等）
   - 每个人物包含：基本信息、性格特点、语言风格、经典语录
   - 支持自定义添加人物

2. **智能对话引擎**
   - 基于选定人物构建专门的系统提示词
   - 实时调用AI API生成回复
   - 保持对话上下文连贯性

3. **对话界面**
   - 类似微信的聊天界面
   - 显示选定人物头像和信息
   - 支持文字输入和历史记录查看

### 7天开发计划（Nuxt.js 版本）

**Day 1: 项目初始化和基础设置**
- 创建Nuxt.js 3项目 (`npx nuxi@latest init chatwithyou`)
- 配置TypeScript、TailwindCSS、UI库
- 设置MongoDB连接和Prisma ORM
- 搭建基本页面结构和路由

**Day 2: 角色管理和数据建模**
- 设计数据库Schema (用户、角色、对话)
- 实现角色管理API (`/api/characters/`)
- 创建角色选择页面和组件
- 添加角色数据种子文件

**Day 3: 对话核心功能**
- 实现对话API (`/api/conversations/`)
- 集成OpenAI API服务
- 创建聊天界面组件
- 实现消息发送和接收逻辑

**Day 4: 实时通信和用户体验**
- 集成Socket.io实现实时对话
- 优化聊天界面交互
- 添加消息历史记录功能
- 实现对话上下文管理

**Day 5: AI角色扮演优化**
- 设计智能Prompt生成系统
- 实现角色特征提取和应用
- 测试不同人物的对话效果
- 优化AI回复质量和一致性

**Day 6: 用户认证和完善功能**
- 集成Nuxt Auth用户认证
- 添加用户偏好设置
- 实现对话历史管理
- 错误处理和用户体验优化

**Day 7: 测试、优化和部署**
- 全面功能测试和bug修复
- 性能优化和SEO设置
- 部署到Vercel和MongoDB Atlas
- 域名配置和上线准备

### 关键技术实现（Nuxt.js 版本）

**1. Nuxt.js API 路由实现**
```typescript
// server/api/chat/send.post.ts
export default defineEventHandler(async (event) => {
  const { message, characterId, conversationId } = await readBody(event)
  
  // 验证用户身份
  const user = await getUserFromToken(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // 获取对话和角色信息
  const conversation = await getConversation(conversationId)
  const character = await getCharacter(characterId)
  
  // 构建AI提示词
  const prompt = buildCharacterPrompt(character, conversation.history)
  
  // 调用OpenAI API
  const aiResponse = await generateAIResponse(prompt, message)
  
  // 保存消息
  await saveMessage(conversationId, {
    type: 'user',
    content: message,
    timestamp: new Date()
  })
  
  await saveMessage(conversationId, {
    type: 'ai',
    content: aiResponse,
    timestamp: new Date()
  })
  
  return { response: aiResponse }
})
```

**2. Vue Composables 实现**
```typescript
// composables/useChat.ts
export const useChat = (characterId: string) => {
  const messages = ref<Message[]>([])
  const isLoading = ref(false)
  const conversationId = ref<string>()

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    // 添加用户消息到界面
    messages.value.push({
      type: 'user',
      content,
      timestamp: new Date()
    })

    isLoading.value = true

    try {
      // 发送到API
      const { data } = await $fetch('/api/chat/send', {
        method: 'POST',
        body: {
          message: content,
          characterId: characterId,
          conversationId: conversationId.value
        }
      })

      // 添加AI回复到界面
      messages.value.push({
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('发送消息失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    messages: readonly(messages),
    isLoading: readonly(isLoading),
    sendMessage
  }
}
```

**3. Socket.io 集成**
```typescript
// server/plugins/socketio.ts
import { Server } from 'socket.io'
import type { NitroApp } from 'nitropack'

export default async (nitroApp: NitroApp) => {
  const io = new Server(nitroApp.hooks.render.route, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log('用户连接:', socket.id)

    socket.on('join-conversation', (conversationId) => {
      socket.join(conversationId)
    })

    socket.on('send-message', async (data) => {
      const { message, characterId, conversationId } = data
      
      // 处理消息逻辑
      const aiResponse = await processMessage(message, characterId, conversationId)
      
      // 广播回复给对话房间
      io.to(conversationId).emit('ai-response', {
        message: aiResponse,
        timestamp: new Date()
      })
    })

    socket.on('disconnect', () => {
      console.log('用户断开连接:', socket.id)
    })
  })
}
```

**4. 数据库Schema (Prisma)**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id            String         @id @default(auto()) @map("_id") @db.ObjectId
  email         String         @unique
  name          String
  avatar        String?
  conversations Conversation[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Character {
  id            String         @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  avatar        String
  background    String
  personality   String[]
  speakingStyle String
  quotes        String[]
  category      String
  isActive      Boolean        @default(true)
  conversations Conversation[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Conversation {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  user        User      @relation(fields: [userId], references: [id])
  userId      String    @db.ObjectId
  character   Character @relation(fields: [characterId], references: [id])
  characterId String    @db.ObjectId
  messages    Message[]
  title       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Message {
  id             String       @id @default(auto()) @map("_id") @db.ObjectId
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  conversationId String       @db.ObjectId
  type           String       // 'user' | 'ai'
  content        String
  timestamp      DateTime     @default(now())
}
```

### 项目结构（Nuxt.js 版本）

```
ChatWithYou-Nuxt/
├── pages/                          # 页面路由
│   ├── index.vue                   # 首页 - 角色选择
│   ├── chat/
│   │   └── [id].vue                # 对话页面
│   ├── history.vue                 # 对话历史
│   └── profile.vue                 # 用户设置
│
├── components/                     # Vue组件
│   ├── Character/
│   │   ├── CharacterCard.vue       # 角色卡片
│   │   ├── CharacterGrid.vue       # 角色网格
│   │   └── CharacterDetail.vue     # 角色详情
│   ├── Chat/
│   │   ├── ChatInterface.vue       # 聊天界面
│   │   ├── MessageBubble.vue       # 消息气泡
│   │   ├── InputArea.vue           # 输入区域
│   │   └── TypingIndicator.vue     # 输入状态指示
│   └── UI/
│       ├── AppHeader.vue           # 应用头部
│       ├── AppSidebar.vue          # 侧边栏
│       └── LoadingSpinner.vue      # 加载动画
│
├── composables/                    # 可组合函数
│   ├── useAuth.ts                  # 认证状态管理
│   ├── useChat.ts                  # 聊天功能
│   ├── useCharacters.ts            # 角色管理
│   ├── useWebSocket.ts             # WebSocket连接
│   └── useLocalStorage.ts          # 本地存储
│
├── server/                         # 服务端代码
│   ├── api/                        # API路由
│   │   ├── auth/
│   │   │   ├── login.post.ts
│   │   │   └── register.post.ts
│   │   ├── characters/
│   │   │   ├── index.get.ts        # 获取角色列表
│   │   │   ├── [id].get.ts         # 获取单个角色
│   │   │   └── search.get.ts       # 搜索角色
│   │   ├── conversations/
│   │   │   ├── index.get.ts        # 获取对话列表
│   │   │   ├── [id].get.ts         # 获取对话详情
│   │   │   └── create.post.ts      # 创建新对话
│   │   ├── chat/
│   │   │   └── send.post.ts        # 发送消息
│   │   └── ai/
│   │       └── generate.post.ts    # AI生成回复
│   ├── middleware/                 # 中间件
│   │   ├── auth.ts                 # 认证中间件
│   │   ├── rateLimit.ts            # 限流中间件
│   │   └── cors.ts                 # CORS中间件
│   ├── plugins/                    # 服务端插件
│   │   ├── mongodb.ts              # MongoDB连接
│   │   └── socketio.ts             # Socket.io配置
│   └── utils/                      # 服务端工具
│       ├── ai.ts                   # AI服务封装
│       ├── db.ts                   # 数据库操作
│       └── auth.ts                 # 认证工具
│
├── stores/                         # Pinia状态管理
│   ├── auth.ts                     # 用户认证状态
│   ├── chat.ts                     # 聊天状态
│   └── ui.ts                       # UI状态
│
├── types/                          # TypeScript类型定义
│   ├── api.ts                      # API类型
│   ├── character.ts                # 角色类型
│   ├── conversation.ts             # 对话类型
│   └── user.ts                     # 用户类型
│
├── contracts/                      # API契约定义（可选）
│   ├── character.contract.ts       # 角色API契约
│   ├── conversation.contract.ts    # 对话API契约
│   └── auth.contract.ts            # 认证API契约
│
├── schemas/                        # 数据验证Schema
│   ├── character.schema.ts         # 角色数据验证
│   ├── message.schema.ts           # 消息数据验证
│   └── user.schema.ts              # 用户数据验证
│
├── prisma/                         # Prisma ORM
│   ├── schema.prisma               # 数据库模式
│   └── seed.ts                     # 数据种子
│
├── public/                         # 静态资源
│   ├── avatars/                    # 角色头像
│   └── icons/                      # 图标资源
│
├── nuxt.config.ts                  # Nuxt配置
├── tailwind.config.js              # TailwindCSS配置
├── package.json                    # 项目依赖
└── README.md                       # 项目说明
```

### 预设人物数据结构

```json
{
  "characters": [
    {
      "id": "luxun",
      "name": "鲁迅",
      "avatar": "/avatars/luxun.jpg",
      "background": "中国现代文学奠基人，思想家，革命家",
      "personality": "犀利、深刻、讽刺、忧国忧民",
      "speaking_style": "文言白话结合，善用比喻和讽刺",
      "quotes": [
        "横眉冷对千夫指，俯首甘为孺子牛",
        "不在沉默中爆发，就在沉默中灭亡"
      ],
      "knowledge_areas": ["文学", "社会批判", "人性思考"]
    }
  ]
}
```

### 成本预估（Nuxt.js 版本）

- **开发成本**：7天个人开发
- **API成本**：OpenAI API约$10-20/月（取决于使用量）
- **数据库成本**：MongoDB Atlas免费套餐512MB
- **部署成本**：Vercel免费套餐（个人项目足够）
- **域名成本**：$10-15/年（可选）
- **总初期成本**：< $50/年

### Nuxt.js 特有优势

1. **开发体验**：
   - 零配置TypeScript支持
   - 自动导入组件和composables
   - 内置开发工具和调试支持
   - 热重载和快速刷新

2. **性能优化**：
   - 自动代码分割和懒加载
   - 图片优化和WebP支持
   - CSS代码分割和压缩
   - 预渲染和静态生成

3. **SEO友好**：
   - 服务端渲染(SSR)支持
   - 自动生成meta标签
   - 结构化数据支持
   - sitemap自动生成

4. **全栈能力**：
   - 内置API路由系统
   - 服务端中间件支持
   - 数据库连接和ORM集成
   - 认证系统集成

5. **类型安全统一**：
   - 前后端共享TypeScript类型
   - 自动类型推断和验证
   - 编译时错误检查
   - 无需额外的Contract层（可选）

### 类型定义统一方案

在Nuxt.js中，前后端可以完全共享类型定义，无需传统的Contracts层，但我们可以采用更优雅的方案：

**1. 共享类型定义**
```typescript
// types/character.ts - 前后端共享
export interface Character {
  id: string
  name: string
  avatar: string
  background: string
  personality: string[]
  speakingStyle: string
  quotes: string[]
  category: CharacterCategory
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateCharacterRequest {
  name: string
  background: string
  personality: string[]
  speakingStyle: string
  quotes: string[]
  category: CharacterCategory
}

export interface UpdateCharacterRequest extends Partial<CreateCharacterRequest> {
  id: string
}

export enum CharacterCategory {
  HISTORICAL = 'historical',
  FICTIONAL = 'fictional',
  CELEBRITY = 'celebrity',
  CUSTOM = 'custom'
}
```

**2. API响应类型**
```typescript
// types/api.ts - 统一API响应格式
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// API端点类型定义
export interface CharacterEndpoints {
  'GET /api/characters': {
    query?: {
      category?: CharacterCategory
      search?: string
      page?: number
      limit?: number
    }
    response: PaginatedResponse<Character>
  }
  
  'GET /api/characters/[id]': {
    params: { id: string }
    response: ApiResponse<Character>
  }
  
  'POST /api/characters': {
    body: CreateCharacterRequest
    response: ApiResponse<Character>
  }
  
  'PUT /api/characters/[id]': {
    params: { id: string }
    body: UpdateCharacterRequest
    response: ApiResponse<Character>
  }
}
```

**3. 数据验证Schema（使用Zod）**
```typescript
// schemas/character.schema.ts
import { z } from 'zod'

export const CharacterCategorySchema = z.enum([
  'historical', 'fictional', 'celebrity', 'custom'
])

export const CreateCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  background: z.string().min(10).max(1000),
  personality: z.array(z.string()).min(1).max(10),
  speakingStyle: z.string().min(10).max(500),
  quotes: z.array(z.string()).max(20),
  category: CharacterCategorySchema
})

export const UpdateCharacterSchema = CreateCharacterSchema.partial().extend({
  id: z.string()
})

// 自动推断类型
export type CreateCharacterRequest = z.infer<typeof CreateCharacterSchema>
export type UpdateCharacterRequest = z.infer<typeof UpdateCharacterSchema>
```

**4. 服务端API实现**
```typescript
// server/api/characters/index.get.ts
export default defineEventHandler(async (event): Promise<PaginatedResponse<Character>> => {
  const query = getQuery(event)
  
  // 类型验证
  const { category, search, page = 1, limit = 10 } = query
  
  try {
    const characters = await characterService.findMany({
      category: category as CharacterCategory,
      search: search as string,
      page: Number(page),
      limit: Number(limit)
    })
    
    return {
      success: true,
      data: characters.items,
      pagination: characters.pagination
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch characters'
    })
  }
})
```

**5. 客户端API调用**
```typescript
// composables/useCharacters.ts
export const useCharacters = () => {
  // 类型安全的API调用
  const fetchCharacters = async (params?: {
    category?: CharacterCategory
    search?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Character>> => {
    return await $fetch('/api/characters', {
      query: params
    })
  }
  
  const fetchCharacter = async (id: string): Promise<ApiResponse<Character>> => {
    return await $fetch(`/api/characters/${id}`)
  }
  
  const createCharacter = async (
    data: CreateCharacterRequest
  ): Promise<ApiResponse<Character>> => {
    return await $fetch('/api/characters', {
      method: 'POST',
      body: data
    })
  }
  
  return {
    fetchCharacters,
    fetchCharacter,
    createCharacter
  }
}
```

**6. 高级类型安全API（可选 - tRPC风格）**
```typescript
// contracts/api.contract.ts - 可选的契约层
import type { CharacterEndpoints } from '~/types/api'

export type ApiContract = CharacterEndpoints & ConversationEndpoints & AuthEndpoints

// 类型安全的fetch wrapper
export const apiClient = {
  get: <T extends keyof ApiContract>(
    endpoint: T,
    ...args: ApiContract[T] extends { query?: infer Q } ? [query?: Q] : []
  ): Promise<ApiContract[T]['response']> => {
    return $fetch(endpoint, { query: args[0] })
  },
  
  post: <T extends keyof ApiContract>(
    endpoint: T,
    ...args: ApiContract[T] extends { body: infer B } ? [body: B] : []
  ): Promise<ApiContract[T]['response']> => {
    return $fetch(endpoint, { method: 'POST', body: args[0] })
  }
}

// 使用示例
const characters = await apiClient.get('/api/characters', { 
  category: 'historical',
  page: 1 
}) // 自动推断返回类型
```

**7. 服务端验证中间件**
```typescript
// server/middleware/validation.ts
import { z } from 'zod'

export const validateBody = <T extends z.ZodSchema>(schema: T) => {
  return defineEventHandler(async (event) => {
    if (event.node.req.method === 'POST' || event.node.req.method === 'PUT') {
      const body = await readBody(event)
      
      try {
        const validatedData = schema.parse(body)
        event.context.validatedBody = validatedData
      } catch (error) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Validation failed',
          data: error
        })
      }
    }
  })
}

// 使用示例
// server/api/characters/index.post.ts
export default defineEventHandler({
  onRequest: [validateBody(CreateCharacterSchema)],
  handler: async (event) => {
    const data = event.context.validatedBody as CreateCharacterRequest
    // data 已经是验证过的类型安全数据
    const character = await characterService.create(data)
    return { success: true, data: character }
  }
})
```

### 风险控制（Nuxt.js 版本）

1. **AI API限流**：
   - 使用Nuxt Rate Limit模块
   - 实现请求队列和重试机制
   - 添加用户级别限流

2. **角色一致性**：
   - 建立完善的角色测试用例
   - 实现A/B测试比较不同prompt效果
   - 用户反馈收集和优化机制

3. **性能优化**：
   - Nuxt内置图片优化
   - 组件懒加载和预取
   - CDN缓存策略
   - 数据库查询优化

4. **扩展性设计**：
   - 模块化组件设计
   - 插件系统支持
   - 多语言国际化准备
   - 移动端适配

5. **安全防护**：
   - CSRF保护
   - XSS防护
   - SQL注入防护
   - 用户输入验证和清理

### 快速开始命令

```bash
# 创建新项目
npx nuxi@latest init chatwithyou
cd chatwithyou

# 安装依赖
npm install

# 安装额外依赖
npm install @prisma/client prisma socket.io openai zod

# 安装UI库
npm install @nuxt/ui @headlessui/vue @heroicons/vue

# 安装认证
npm install @sidebase/nuxt-auth

# 启动开发服务器
npm run dev
```

### 类型安全最佳实践总结

**优势：**
1. **无需Contracts层**：Nuxt.js天然支持前后端类型共享
2. **编译时检查**：TypeScript在编译时就能发现类型错误
3. **自动完成**：IDE提供完整的类型提示和自动完成
4. **重构安全**：修改类型定义会自动检查所有使用地方

**推荐方案：**
- **基础项目**：直接共享types目录，无需额外contracts
- **大型项目**：可以添加contracts层提供更严格的API契约
- **团队协作**：使用Zod进行运行时验证，确保数据一致性

**文件组织：**
```
types/          # 基础类型定义（必需）
schemas/        # 数据验证（推荐）
contracts/      # API契约（可选，大型项目）
```

这个技术方案充分考虑了7天的开发时间限制，选择了成熟稳定的技术栈，并且提供了清晰的开发路径和实现细节。

**使用Nuxt.js的核心优势：**
1. **全栈统一**：前后端使用同一套技术栈，减少上下文切换
2. **开发效率**：内置的API路由、自动导入、热重载等特性大幅提升开发速度
3. **部署简单**：一键部署到Vercel，无需复杂的服务器配置
4. **SEO友好**：内置SSR支持，有利于搜索引擎优化
5. **类型安全**：完整的TypeScript支持，减少运行时错误
6. **现代化**：使用最新的Vue 3 Composition API和现代前端工具链