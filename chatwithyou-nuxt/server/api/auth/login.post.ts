import { prisma } from "~/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { LoginRequest, AuthResponse, ApiResponse } from "~/types";

export default defineEventHandler(async (event) => {
  try {
    const body: LoginRequest = await readBody(event);
    console.log("登录请求:", { email: body.email });

    // 验证必填字段
    if (!body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: "邮箱和密码都是必填的",
      });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "邮箱或密码错误",
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: "邮箱或密码错误",
      });
    }

    console.log("用户登录成功:", user.id);

    // 生成JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError({
        statusCode: 500,
        statusMessage: "JWT_SECRET 未配置",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: userResponse,
        token,
      },
    };

    return response;
  } catch (error: any) {
    console.error("登录API错误:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "登录失败",
      data: { error: error.message },
    });
  }
});
