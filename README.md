# ChatWithYou - 仿真电话亭

> 🎭 与历史名人、文学角色或虚构人物进行深度对话，体验跨越时空的交流魅力

## 📖 项目简介

ChatWithYou 是一个基于 AI 的角色扮演对话平台，就像《哆啦A梦》中的道具「仿真电话亭」一样。用户可以选择任何历史人物、虚构角色进行真实的对话体验，AI 会完美模拟对方的性格、说话风格和思维方式。

### 🎯 核心功能

- 🎭 **智能角色扮演**: AI 精确模拟历史名人和虚构角色
- 💬 **实时对话体验**: 流畅的聊天界面，支持长对话
- 👥 **丰富角色库**: 预设经典人物（鲁迅、孔子、爱因斯坦等）
- 🏷️ **角色分类管理**: 历史人物、虚构角色、现代名人等
- 📱 **响应式设计**: 支持桌面和移动端访问

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/BakerSean168/chat-with-you.git
cd chat-with-you/chatwithyou-nuxt
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 环境配置

复制并配置环境变量：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下必要参数：

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/chat-with-you?schema=public"

# AI API 密钥（支持多个 AI 服务商）
OPENAI_API_KEY="your_openai_api_key"
QI_NIU_YUN_API_KEY="your_qiniu_api_key"

# 应用配置
PORT=4000
NUXT_PUBLIC_APP_URL="http://localhost:4000"
```

### 4. 数据库设置

#### 使用 PostgreSQL
```bash
# 启动 PostgreSQL 服务
# 创建数据库: chat-with-you

# 运行数据库迁移
pnpm prisma db push

# 导入预设角色数据
pnpm run db:seed
```

#### 使用 SQLite（开发环境）
```bash
# 修改 .env 中的 DATABASE_URL
DATABASE_URL="file:./dev.db"

# 运行迁移和种子数据
pnpm prisma db push
pnpm run db:seed
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:4000 开始使用！

## 🎭 预设角色

项目已包含以下经典角色，运行 `pnpm run db:seed` 后即可使用：

### 📚 历史人物
- **鲁迅** - 中国现代文学奠基人，以犀利文风著称
- **孔子** - 儒家学派创始人，教育家和思想家  
- **爱因斯坦** - 物理学家，相对论创立者
- **诸葛亮** - 三国时期蜀汉丞相，智慧的象征
- **苏格拉底** - 古希腊哲学家，哲学思辨大师
- **李白** - 唐代浪漫主义诗人，诗仙

### 🎬 虚构角色  
- **夏洛克·福尔摩斯** - 世界著名侦探，推理大师
- **齐天大圣孙悟空** - 西游记主角，机智勇敢
- **名侦探柯南** - 日本推理动漫角色
- **诸葛孔明（三国演义版）** - 文学作品中的智慧化身

### 🌟 现代名人
- **史蒂夫·乔布斯** - 苹果公司创始人，创新领袖  
- **埃隆·马斯克** - 企业家，未来主义者
- **唐僧** - 西游记角色，慈悲智慧的象征

## 🛠️ 技术架构

### 前端技术栈
- **Nuxt.js 3** - 全栈 Vue.js 框架
- **TypeScript** - 类型安全的 JavaScript
- **TailwindCSS** - 现代化 CSS 框架
- **Nuxt UI** - 优雅的 UI 组件库

### 后端技术栈
- **Nitro** - Nuxt 内置的服务端引擎
- **Prisma** - 现代化的 ORM 工具
- **PostgreSQL** - 生产级关系型数据库
- **Zod** - 数据验证和类型安全

### AI 集成
- **七牛云 AI** - 主要的 AI 对话服务
- **OpenAI GPT** - 备用 AI 服务
- **智能 Prompt 工程** - 精确的角色扮演提示词

## 📁 项目结构

```
chatwithyou-nuxt/
├── pages/                    # 页面路由
│   ├── index.vue            # 角色选择首页
│   └── chat/[id].vue        # 对话页面
├── components/              # Vue 组件
│   ├── Character/           # 角色相关组件
│   └── Chat/               # 聊天相关组件
├── server/                 # 服务端代码
│   └── api/                # API 路由
├── prisma/                 # 数据库相关
│   ├── schema.prisma       # 数据库模式
│   └── seed.ts            # 种子数据
├── types/                  # TypeScript 类型定义
└── schemas/               # 数据验证 Schema
```

## 🎨 使用指南

### 选择角色对话

1. 访问首页，浏览可用角色
2. 使用分类标签筛选角色类型
3. 点击角色卡片开始对话

### 对话体验

- 💬 输入您想聊的话题
- 🎭 AI 会以所选角色的口吻回复
- 📖 每个角色都有独特的性格和说话风格
- 🔄 支持连续对话，保持上下文

### 角色特色

每个预设角色都经过精心设计：
- **性格特征**: 准确还原历史人物性格
- **说话风格**: 符合时代背景的语言特色
- **知识背景**: 丰富的专业知识和人生阅历
- **经典语录**: 著名的名言警句

## 🔧 开发指南

### 添加新角色

1. 编辑 `prisma/seed.ts` 添加角色数据
2. 重新运行种子脚本：`pnpm run db:seed`
3. 自定义角色的性格、背景和说话风格

### API 开发

```typescript
// 获取所有角色
GET /api/characters

// 获取单个角色
GET /api/characters/:id

// 发送消息
POST /api/chat/send
{
  "message": "你好",
  "characterId": "character_id",
  "conversationId": "conversation_id"
}
```

### 环境配置

开发环境支持多种配置：

```env
# 开发模式
NODE_ENV=development
PORT=4000

# AI 服务配置
QI_NIU_YUN_API_KEY=sk-xxx
QI_NIU_YUN_BASE_URL=https://openai.qiniu.com/v1
QI_NIU_YUN_MODEL_ID=nvidia/llama-3.3-nemotron-super-49b-v1.5

# 数据库配置
DATABASE_URL="postgresql://user:pass@localhost:5432/chat-with-you"
```

## 📄 脚本命令

```bash
# 开发服务器
pnpm dev

# 构建项目
pnpm build

# 数据库相关
pnpm prisma db push      # 推送数据库变更
pnpm prisma studio       # 打开数据库管理界面
pnpm run db:seed         # 导入种子数据

# 代码质量
pnpm lint               # 代码检查
pnpm type-check         # 类型检查
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 贡献内容

- 🎭 新的角色定义
- 🐛 Bug 修复
- ⚡ 性能优化
- 📝 文档改进
- 🎨 UI/UX 改进

## 📝 License

本项目基于 MIT License 开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 💬 联系我们

- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/BakerSean168/chat-with-you/issues)
- 💡 Discussions: [GitHub Discussions](https://github.com/BakerSean168/chat-with-you/discussions)

## 🙏 致谢

- 感谢所有贡献者的努力
- 感谢开源社区提供的优秀工具
- 特别感谢《哆啦A梦》给予的创意灵感

---

**开始您的跨时空对话之旅吧！** 🚀
