# 快速部署指南

## 本地开发环境搭建

### 1. 环境准备
- 确保已安装 Node.js 18+ 和 pnpm
- 准备 MongoDB 数据库（本地或云端）
- 获取 OpenAI API Key

### 2. 项目配置
```bash
# 进入项目目录
cd chatwithyou-nuxt

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

### 3. 数据库初始化
```bash
# 生成 Prisma 客户端
pnpm prisma generate

# 推送数据库结构
pnpm prisma db push

# 播种示例数据
pnpm db:seed
```

### 4. 启动开发服务器
```bash
pnpm dev
```

访问 http://localhost:3000 即可查看应用。

## 生产环境部署

### Vercel 部署（推荐）

1. **准备代码仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repository-url
   git push -u origin main
   ```

2. **在 Vercel 中导入项目**
   - 访问 https://vercel.com
   - 点击 "New Project"
   - 导入你的 GitHub 仓库

3. **配置环境变量**
   在 Vercel 项目设置中添加以下环境变量：
   ```
   DATABASE_URL=your_mongodb_connection_string
   OPENAI_API_KEY=your_openai_api_key
   JWT_SECRET=your_jwt_secret
   NUXT_AUTH_SECRET=your_auth_secret
   NUXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

4. **部署**
   - Vercel 会自动检测 Nuxt.js 项目
   - 点击 "Deploy" 开始部署

### 云数据库推荐

**MongoDB Atlas**（免费套餐）:
1. 访问 https://mongodb.com/atlas
2. 创建免费集群
3. 获取连接字符串
4. 设置网络访问权限（允许所有 IP 或配置白名单）

## 环境变量说明

```env
# MongoDB 数据库连接字符串
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/chatwithyou"

# OpenAI API 密钥（从 https://platform.openai.com/api-keys 获取）
OPENAI_API_KEY="sk-proj-..."

# JWT 签名密钥（随机生成的长字符串）
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"

# NextAuth 密钥（随机生成的长字符串）
NUXT_AUTH_SECRET="your-nextauth-secret-key-at-least-32-characters"

# 应用公共 URL
NUXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 功能验证清单

部署完成后，请验证以下功能：

- [ ] 首页正常加载，显示角色列表
- [ ] 点击角色卡片能够进入聊天页面
- [ ] 发送消息能够收到 AI 回复
- [ ] 历史记录页面显示对话列表
- [ ] 响应式布局在移动端正常工作

## 常见问题

### 1. 数据库连接失败
- 检查 `DATABASE_URL` 是否正确
- 确认 MongoDB 服务正在运行
- 检查网络连接和防火墙设置

### 2. OpenAI API 错误
- 验证 `OPENAI_API_KEY` 是否有效
- 检查 API 使用额度是否充足
- 确认 API 密钥权限设置

### 3. 构建失败
- 确保所有依赖已正确安装
- 检查 TypeScript 类型错误
- 查看构建日志中的详细错误信息

### 4. 性能优化建议
- 启用 Vercel 的 Edge Functions
- 配置合适的缓存策略
- 使用 CDN 加速静态资源

## 监控和维护

### 日志监控
- 使用 Vercel Analytics 监控访问量
- 设置错误日志收集
- 监控 API 响应时间

### 数据库维护
- 定期备份数据库
- 监控数据库性能
- 清理过期数据

### 成本控制
- 监控 OpenAI API 使用量
- 设置使用限额
- 优化数据库查询

---

如有问题，请查看完整的 README.md 文档或提交 Issue。