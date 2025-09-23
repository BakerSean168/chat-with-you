import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "~/lib/prisma";
import type { ApiResponse, LoginResponse } from "~/types";
import { LoginSchema } from "~/schemas";

export default defineEventHandler(
  async (event): Promise<ApiResponse<LoginResponse>> => {
    try {
      const body = await readBody(event);

      // 验证请求体
      const validatedData = LoginSchema.parse(body);
      const { email, password } = validatedData;

      // 查找用户
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw createError({
          statusCode: 401,
          statusMessage: "Invalid email or password",
        });
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw createError({
          statusCode: 401,
          statusMessage: "Invalid email or password",
        });
      }

      // 生成JWT token
      const runtimeConfig = useRuntimeConfig();
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        runtimeConfig.jwtSecret,
        { expiresIn: "7d" }
      );

      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword as any,
          token,
        },
      };
    } catch (error) {
      console.error("Login API error:", error);

      if (error.statusCode) {
        throw error;
      }

      throw createError({
        statusCode: 500,
        statusMessage: "Login failed",
      });
    }
  }
);
