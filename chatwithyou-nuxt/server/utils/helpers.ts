// 获取客户端IP地址
export function getClientIP(event: any): string {
  // 尝试从各种头部获取真实IP
  const headers = event.node.req.headers;

  const xForwardedFor = headers["x-forwarded-for"];
  if (xForwardedFor) {
    // x-forwarded-for 可能包含多个IP，取第一个
    return Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor.split(",")[0].trim();
  }

  const xRealIp = headers["x-real-ip"];
  if (xRealIp) {
    return Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
  }

  const xClientIp = headers["x-client-ip"];
  if (xClientIp) {
    return Array.isArray(xClientIp) ? xClientIp[0] : xClientIp;
  }

  // 回退到连接的远程地址
  return event.node.req.socket?.remoteAddress || "unknown";
}

// 错误处理工具函数
export function handleApiError(
  error: unknown,
  defaultMessage: string = "Internal server error"
) {
  console.error("API Error:", error);

  // 如果是已知的HTTP错误，直接抛出
  if (error && typeof error === "object" && "statusCode" in error) {
    throw error;
  }

  // 如果是Prisma错误
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as any;

    switch (prismaError.code) {
      case "P2002":
        throw createError({
          statusCode: 409,
          statusMessage: "Record already exists",
        });
      case "P2025":
        throw createError({
          statusCode: 404,
          statusMessage: "Record not found",
        });
      default:
        throw createError({
          statusCode: 500,
          statusMessage: "Database error",
        });
    }
  }

  // 如果是Zod验证错误
  if (error && typeof error === "object" && "issues" in error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation error",
      data: error,
    });
  }

  // 默认错误
  throw createError({
    statusCode: 500,
    statusMessage: defaultMessage,
  });
}

// JWT工具函数
export function extractTokenFromHeader(event: any): string | null {
  const authorization = getHeader(event, "authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice(7); // 移除 'Bearer ' 前缀
}

// 响应格式化函数
export function createSuccessResponse<T>(data?: T, message?: string) {
  return {
    success: true,
    data,
    message,
  };
}

export function createErrorResponse(message: string, details?: any) {
  return {
    success: false,
    error: message,
    details,
  };
}

// 分页工具函数
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

// 验证ObjectId格式（MongoDB）
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// 清理敏感数据
export function sanitizeUser(user: any) {
  const { password, ...sanitized } = user;
  return sanitized;
}

// 格式化日期
export function formatDate(date: Date): string {
  return date.toISOString();
}

// 生成随机字符串
export function generateRandomString(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
