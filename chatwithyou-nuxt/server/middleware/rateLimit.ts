// 请求计数器存储
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// 限流配置
interface RateLimitConfig {
  windowMs: number; // 时间窗口（毫秒）
  maxRequests: number; // 最大请求数
  message?: string; // 自定义错误消息
}

// 默认配置
const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15分钟
  maxRequests: 100, // 100次请求
  message: "Too many requests, please try again later.",
};

// 限流中间件
export const rateLimit = (config: Partial<RateLimitConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  return defineEventHandler(async (event) => {
    // 获取客户端IP
    const clientIp = getClientIP(event) || "unknown";
    const now = Date.now();

    // 获取或创建请求计数记录
    const requestData = requestCounts.get(clientIp);

    if (!requestData || now > requestData.resetTime) {
      // 创建新的计数记录或重置过期的记录
      requestCounts.set(clientIp, {
        count: 1,
        resetTime: now + finalConfig.windowMs,
      });
    } else {
      // 增加请求计数
      requestData.count++;

      // 检查是否超过限制
      if (requestData.count > finalConfig.maxRequests) {
        throw createError({
          statusCode: 429,
          statusMessage: finalConfig.message,
        });
      }
    }
  });
};

// API限流中间件（更严格）
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  maxRequests: 50, // 50次请求
  message: "API rate limit exceeded. Please try again later.",
});

// AI聊天限流中间件（防止滥用）
export const aiChatRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分钟
  maxRequests: 10, // 10次请求
  message:
    "AI chat rate limit exceeded. Please wait before sending more messages.",
});

// 清理过期的计数记录（定时任务）
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 60 * 1000); // 每分钟清理一次

// 默认导出基础限流中间件
export default rateLimit();
