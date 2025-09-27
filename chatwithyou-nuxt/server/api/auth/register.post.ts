import { prisma } from "~/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { RegisterRequest, AuthResponse, ApiResponse } from "~/types";

export default defineEventHandler(async (event) => {
  try {
    const body: RegisterRequest = await readBody(event);
    console.log("注册请求:", { email: body.email, name: body.name });

    // 验证必填字段
    if (!body.email || !body.name || !body.password || !body.confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: "所有字段都是必填的",
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      throw createError({
        statusCode: 400,
        statusMessage: "邮箱格式不正确",
      });
    }

    // 验证密码长度
    if (body.password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: "密码长度至少6个字符",
      });
    }

    // 验证密码确认
    if (body.password !== body.confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: "两次输入的密码不一致",
      });
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: "该邮箱已被注册",
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(body.password, 12);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: hashedPassword,
        // avatar 字段暂时不处理，使用默认值
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("用户创建成功:", user.id);

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

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: {
          ...user,
          avatar: user.avatar || undefined,
        },
        token,
      },
    };

    return response;
  } catch (error: any) {
    console.error("注册API错误:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "注册失败",
      data: { error: error.message },
    });
  }
});
