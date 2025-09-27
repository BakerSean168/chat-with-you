import jwt from "jsonwebtoken";
import type { JWTPayload, User } from "~/types";

/**
 * JWT认证中间件
 * 验证Authorization header中的JWT token
 * 如果有效，在event.context中设置用户信息
 */
export async function authenticateUser(event: any): Promise<User | null> {
  try {
    const authHeader = getHeader(event, "authorization");

    if (!authHeader) {
      return null;
    }

    // 提取Bearer token
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      return null;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET 未配置");
      return null;
    }

    // 验证JWT token
    const payload = jwt.verify(token, jwtSecret) as JWTPayload;

    if (!payload.userId) {
      console.error("JWT payload 中缺少 userId");
      return null;
    }

    // 从数据库获取用户信息（确保用户仍然存在且活跃）
    const { prisma } = await import("~/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      console.error("用户不存在:", payload.userId);
      return null;
    }

    return {
      ...user,
      avatar: user.avatar || undefined,
    };
  } catch (error: any) {
    console.error("JWT认证错误:", error.message);
    return null;
  }
}

/**
 * 要求认证的中间件
 * 如果用户未认证，抛出401错误
 */
export async function requireAuth(event: any): Promise<User> {
  const user = await authenticateUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "需要登录",
    });
  }

  // 将用户信息存储在event.context中，供后续使用
  event.context.user = user;

  return user;
}
