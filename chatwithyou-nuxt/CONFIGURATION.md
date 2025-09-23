# ChatWithYou 项目配置指南

## 🎉 配置完成状态

### ✅ 已完成的配置

1. **环境变量配置**
   - ✅ `.env.example` - 完整的环境变量模板
   - ✅ `.env` - 基础环境变量文件
   - ✅ 包含了所有必要的配置项

2. **Git 配置**
   - ✅ `.gitignore` - 完整的 Nuxt.js 项目忽略文件
   - ✅ 包含了所有常见的忽略模式

3. **Nuxt.js 配置**
   - ✅ `nuxt.config.ts` - 完整的配置文件
   - ✅ 所有必要模块已启用
   - ✅ TypeScript 支持
   - ✅ 中间件恢复正常

4. **服务器状态**
   - ✅ 开发服务器成功启动
   - ✅ 运行在 `http://localhost:3000/`
   - ✅ 所有模块正常加载

## 📋 环境变量配置

### 必须配置的环境变量

在使用应用之前，请确保在 `.env` 文件中配置以下环境变量：

```bash
# 数据库连接
DATABASE_URL="mongodb://localhost:27017/chatwithyou"
# 或者使用 MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/chatwithyou"

# OpenAI API 密钥 (从 https://platform.openai.com/api-keys 获取)
OPENAI_API_KEY="sk-your-actual-openai-api-key-here"

# JWT 密钥 (使用强随机字符串)
JWT_SECRET="your-strong-jwt-secret-key-here"

# NextAuth 密钥 (使用 openssl rand -base64 32 生成)
NUXT_AUTH_SECRET="your-nextauth-secret-here"

# 应用 URL
NUXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🚀 启动项目

### 1. 安装依赖
```bash
pnpm install
```

### 2. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入实际的配置值
```

### 3. 设置数据库
```bash
# 推送数据库模式
pnpm db:push

# 填充初始数据
pnpm db:seed
```

### 4. 启动开发服务器
```bash
pnpm dev
```

应用将在 `http://localhost:3000/` 启动。

## 📁 项目结构

```
chatwithyou-nuxt/
├── assets/              # 静态资源
├── components/          # Vue 组件
├── composables/         # 组合式函数
├── lib/                # 库文件
├── pages/              # 页面文件
├── prisma/             # 数据库模式和种子数据
├── schemas/            # 验证模式
├── server/             # 服务端 API 和中间件
│   ├── api/           # API 路由
│   ├── middleware/    # 服务端中间件
│   └── utils/         # 服务端工具函数
├── stores/             # Pinia 状态管理
├── types/              # TypeScript 类型定义
├── .env                # 环境变量
├── .env.example        # 环境变量模板
├── .gitignore          # Git 忽略文件
├── nuxt.config.ts      # Nuxt 配置
└── package.json        # 项目依赖
```

## 🔧 可用脚本

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm preview          # 预览生产版本

# 数据库
pnpm db:push          # 推送数据库模式
pnpm db:migrate       # 运行数据库迁移
pnpm db:studio        # 打开 Prisma Studio
pnpm db:seed          # 填充种子数据
```

## 🎯 下一步

1. **配置 OpenAI API 密钥**：在 `.env` 文件中添加你的 OpenAI API 密钥
2. **设置数据库**：运行 `pnpm db:push` 和 `pnpm db:seed`
3. **开始开发**：项目已经准备就绪，可以开始开发了！

## ⚠️ 注意事项

- 确保 MongoDB 服务正在运行（如果使用本地数据库）
- 不要将 `.env` 文件提交到版本控制
- 在生产环境中使用强密码和密钥
- AUTH_NO_ORIGIN 警告在开发环境中可以忽略

## 🆘 故障排除

如果遇到启动问题：

1. 删除 `.nuxt` 目录：`rm -rf .nuxt`
2. 重新安装依赖：`rm -rf node_modules && pnpm install`
3. 检查环境变量配置是否正确
4. 确保所有必要的服务（如 MongoDB）正在运行

项目配置已完成！🎉