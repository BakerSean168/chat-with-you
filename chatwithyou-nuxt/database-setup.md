# PostgreSQL 数据库设置指南

## 🔧 创建数据库和用户

### 1. 连接到 PostgreSQL
```bash
# 使用管理员用户连接
psql -U postgres -h localhost
```

### 2. 创建数据库和用户
```sql
-- 创建数据库
CREATE DATABASE "chat-with-you";

-- 创建用户
CREATE USER "admin-chat-with-you" WITH PASSWORD 'admin-chat-with-you156';

-- 授予权限
GRANT ALL PRIVILEGES ON DATABASE "chat-with-you" TO "admin-chat-with-you";

-- 连接到数据库
\c chat-with-you

-- 授予 schema 权限
GRANT ALL ON SCHEMA public TO "admin-chat-with-you";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "admin-chat-with-you";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "admin-chat-with-you";

-- 设置默认权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "admin-chat-with-you";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "admin-chat-with-you";

-- 退出
\q
```

### 3. 验证连接
```bash
# 测试连接
psql -U admin-chat-with-you -d chat-with-you -h localhost
```

## 📋 备选方案

如果上述配置有问题，可以使用简化的数据库连接：

### 选项 1：使用默认 postgres 用户
```env
DATABASE_URL="postgresql://postgres:你的密码@localhost:5432/chat-with-you?schema=public"
```

### 选项 2：创建简单用户
```sql
-- 创建数据库
CREATE DATABASE chatwithyou;

-- 使用默认 postgres 用户，只需修改 .env：
DATABASE_URL="postgresql://postgres:你的postgres密码@localhost:5432/chatwithyou?schema=public"
```

## 🚀 执行步骤

1. 首先运行上述 SQL 命令创建数据库和用户
2. 然后执行 `pnpm db:push` 推送模式
3. 最后运行 `pnpm db:seed` 填充数据