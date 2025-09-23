import { z } from "zod";

// 验证中间件工厂函数
export const validateBody = <T extends z.ZodSchema>(schema: T) => {
  return defineEventHandler(async (event) => {
    if (event.node.req.method === "POST" || event.node.req.method === "PUT") {
      try {
        const body = await readBody(event);
        const validatedData = schema.parse(body);
        event.context.validatedBody = validatedData;
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw createError({
            statusCode: 400,
            statusMessage: "Validation failed",
            data: {
              errors: error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
              })),
            },
          });
        }
        throw error;
      }
    }
  });
};

// 验证查询参数中间件
export const validateQuery = <T extends z.ZodSchema>(schema: T) => {
  return defineEventHandler(async (event) => {
    if (event.node.req.method === "GET") {
      try {
        const query = getQuery(event);
        const validatedQuery = schema.parse(query);
        event.context.validatedQuery = validatedQuery;
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw createError({
            statusCode: 400,
            statusMessage: "Invalid query parameters",
            data: {
              errors: error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
              })),
            },
          });
        }
        throw error;
      }
    }
  });
};

// 默认导出通用验证中间件
export default defineEventHandler(async (event) => {
  // 这里可以添加全局验证逻辑
  // 目前只是一个占位符，具体验证逻辑使用上面的工厂函数
});
