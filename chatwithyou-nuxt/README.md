# ChatWithYou - AI角色对话应用

基于Nuxt.js 3构建的AI角色对话应用，让用户可以与历史人物、虚构角色等进行智能对话。

## 🚀 项目特性

- **多角色对话**：与鲁迅、孔子、爱因斯坦、夏洛克·福尔摩斯等角色对话
- **智能回复**：基于OpenAI GPT模型的智能对话生成
- **实时体验**：WebSocket支持实时消息传输
- **响应式设计**：完美适配桌面端和移动端
- **类型安全**：完整的TypeScript类型系统
- **现代化架构**：Nuxt.js 3 + Prisma + MongoDB

## 🛠️ 技术栈

### 前端
- **Nuxt.js 3** - 全栈Vue.js框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 原子化CSS框架
- **Nuxt UI** - 现代化UI组件库
- **Pinia** - 状态管理
- **Socket.io** - 实时通信

### 后端
- **Nitro** - Nuxt内置服务端引擎
- **Prisma** - 现代化ORM
- **MongoDB** - NoSQL数据库
- **OpenAI API** - AI对话能力
- **JWT** - 身份认证

## 📁 项目结构

```
chatwithyou-nuxt/
├── assets/                    # 静态资源
│   └── css/                   # 样式文件
├── components/                # Vue组件
│   ├── Character/             # 角色相关组件
│   └── Chat/                  # 聊天相关组件
├── composables/               # 组合式函数
│   ├── useCharacters.ts       # 角色管理
│   └── useChat.ts             # 聊天功能
├── lib/                       # 工具库
│   └── prisma.ts              # Prisma客户端
├── pages/                     # 页面路由
│   ├── index.vue              # 首页
│   ├── chat/[id].vue          # 聊天页面
│   └── history.vue            # 历史记录
├── prisma/                    # 数据库
│   ├── schema.prisma          # 数据库模式
│   └── seed.ts                # 数据种子
├── schemas/                   # 数据验证
│   └── index.ts               # Zod验证规则
├── server/                    # 服务端
│   ├── api/                   # API路由
│   ├── middleware/            # 中间件
│   └── utils/                 # 工具函数
├── stores/                    # Pinia状态管理
│   ├── auth.ts                # 认证状态
│   └── chat.ts                # 聊天状态
├── types/                     # TypeScript类型
│   ├── index.ts               # 基础类型
│   └── api.ts                 # API类型
└── nuxt.config.ts             # Nuxt配置
```

## 🚀 快速开始

### 1. 环境要求

- Node.js >= 18
- pnpm >= 8
- MongoDB数据库
- OpenAI API Key

### 2. 安装依赖

```bash
cd chatwithyou-nuxt
pnpm install
```

### 3. 环境配置

复制环境变量模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下环境变量：
```env
DATABASE_URL="mongodb://localhost:27017/chatwithyou"
OPENAI_API_KEY="your_openai_api_key_here"
JWT_SECRET="your_jwt_secret_key_here"
NUXT_AUTH_SECRET="your_nextauth_secret_here"
NUXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. 数据库设置

生成Prisma客户端：
```bash
pnpm prisma generate
```

推送数据库结构：
```bash
pnpm prisma db push
```

播种示例数据：
```bash
pnpm db:seed
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000 查看应用。

## 📱 主要功能

### 1. 角色选择
- 浏览不同分类的AI角色
- 搜索特定角色
- 查看角色详细信息

### 2. 智能对话
- 与AI角色进行自然对话
- 角色保持一致的性格和说话风格
- 实时响应用户消息

### 3. 对话管理
- 查看历史对话记录
- 删除不需要的对话
- 多设备同步对话数据

### 4. 用户认证
- 用户注册和登录
- JWT令牌认证
- 个人信息管理

## 🎯 预设角色

### 历史人物
- **鲁迅**：中国现代文学奠基人，思想深刻，语言犀利
- **孔子**：春秋时期思想家，温和睿智，循循善诱
- **爱因斯坦**：理论物理学家，富有想象力，善用比喻
- **诸葛亮**：三国政治家军事家，智慧忠诚，深谋远虑
- **苏格拉底**：古希腊哲学家，善于提问，启发思考

### 虚构角色
- **夏洛克·福尔摩斯**：世界知名侦探，观察敏锐，逻辑严密

## 🔧 开发命令

```bash
# 开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview

# 数据库操作
pnpm db:push        # 推送数据库结构
pnpm db:migrate     # 运行数据库迁移
pnpm db:studio      # 打开Prisma Studio
pnpm db:seed        # 播种示例数据

# 代码检查
pnpm lint           # ESLint检查
pnpm type-check     # TypeScript类型检查
```

## 🌐 部署指南

### Vercel部署
1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 部署完成

### 环境变量配置
确保在部署平台设置以下环境变量：
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `NUXT_AUTH_SECRET`
- `NUXT_PUBLIC_APP_URL`

## 🔒 安全特性

- **输入验证**：Zod schema验证所有用户输入
- **请求限流**：防止API滥用
- **JWT认证**：安全的用户身份验证
- **密码加密**：bcrypt加密用户密码
- **CORS保护**：跨域请求保护

## 🎨 UI设计

- **响应式布局**：适配各种屏幕尺寸
- **现代化界面**：简洁美观的用户界面
- **流畅动画**：丰富的交互动画效果
- **深色模式**：支持暗色主题（可扩展）

## 📈 性能优化

- **代码分割**：自动按路由分割代码
- **图片优化**：Nuxt内置图片优化
- **缓存策略**：合理的API缓存
- **懒加载**：组件和图片懒加载

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Nuxt.js](https://nuxt.com/) - 优秀的Vue.js框架
- [OpenAI](https://openai.com/) - 强大的AI能力
- [Prisma](https://www.prisma.io/) - 现代化数据库工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用的CSS框架

---

如果这个项目对你有帮助，请给个 ⭐️ 支持一下！