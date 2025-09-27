# 🚀 ChatWithYou 快速启动指南

## 一键启动项目

### 1. 克隆并安装
```bash
git clone https://github.com/BakerSean168/chat-with-you.git
cd chat-with-you/chatwithyou-nuxt
pnpm install
```

### 2. 配置环境变量
复制 `.env` 文件并配置必要参数：
```env
# 数据库（使用 PostgreSQL 或 SQLite）
DATABASE_URL="postgresql://user:pass@localhost:5432/chat-with-you"
# 或者使用 SQLite: DATABASE_URL="file:./dev.db"

# AI API 密钥
QI_NIU_YUN_API_KEY="sk-e265538bbbeaf55e705c170302ce52332baa503f0bd44e0ccd5eae9a0093d0bf"
OPENAI_API_KEY="your_openai_api_key"
```

### 3. 初始化数据库
```bash
# 推送数据库结构
pnpm prisma db push

# 导入预设角色（重要！）
pnpm run db:seed
```

### 4. 启动项目
```bash
pnpm dev
```

访问: http://localhost:3000 或 http://localhost:4000

## 🎭 预设角色一览

运行 `pnpm run db:seed` 后，您将获得以下精彩角色：

### 📚 历史人物
- **鲁迅** - "横眉冷对千夫指，俯首甘为孺子牛"
- **孔子** - "学而时习之，不亦说乎？"  
- **爱因斯坦** - 相对论创立者，科学巨匠
- **诸葛亮** - 智慧的化身，千古名相
- **苏格拉底** - 哲学之父，思辨大师
- **李白** - "安能摧眉折腰事权贵"

### 🎬 虚构角色
- **夏洛克·福尔摩斯** - "当你排除了不可能，剩下的就是真相"
- **孙悟空** - 机智勇敢的齐天大圣
- **名侦探柯南** - 推理界的不老传说

### 🌟 现代名人  
- **史蒂夫·乔布斯** - "Stay hungry, stay foolish"
- **埃隆·马斯克** - 火星梦想家，创新先锋

## ❗ 常见问题

### Q: 首页显示空白或没有角色？
**A:** 请确保已运行种子脚本：`pnpm run db:seed`

### Q: AI 对话没有回复？
**A:** 检查 `.env` 中的 AI API 密钥配置是否正确

### Q: 数据库连接失败？
**A:** 确保 PostgreSQL 服务启动，或使用 SQLite: `DATABASE_URL="file:./dev.db"`

### Q: 端口被占用？
**A:** Nuxt 会自动切换到可用端口（3000/4000），检查终端输出的实际端口

## 🛠️ 开发命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本  
pnpm preview      # 预览构建结果
pnpm run db:seed  # 重新导入角色数据
pnpm prisma studio # 数据库管理界面
```

## 🎮 使用技巧

1. **选择角色**: 首页浏览角色，使用分类筛选
2. **开始对话**: 点击角色卡片，进入聊天界面
3. **体验角色**: 每个角色都有独特的性格和说话风格
4. **话题建议**: 
   - 向鲁迅询问文学创作
   - 与孔子探讨教育哲理
   - 和爱因斯坦讨论科学问题
   - 跟福尔摩斯分析案件

## 🎯 下一步

- 🔧 自定义添加新角色
- 🎨 个性化界面主题  
- 📱 部署到生产环境
- 🤝 邀请朋友体验

---

**现在就开始您的跨时空对话之旅吧！** 🚀