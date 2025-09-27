import { authenticateUser } from "~/server/utils/auth";
import type { ApiResponse, User } from "~/types";

export default defineEventHandler(async (event) => {
  try {
    const user = await authenticateUser(event);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "未登录",
      });
    }

    const response: ApiResponse<User> = {
      success: true,
      data: user,
    };

    return response;
  } catch (error: any) {
    console.error("获取用户信息API错误:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "获取用户信息失败",
    });
  }
});
