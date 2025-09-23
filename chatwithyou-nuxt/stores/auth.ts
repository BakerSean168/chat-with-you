import { defineStore } from "pinia";
import type {
  User,
  LoginRequest,
  CreateUserRequest,
  ApiResponse,
  LoginResponse,
} from "~/types";

export const useAuthStore = defineStore("auth", () => {
  // 状态
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = computed(() => !!user.value && !!token.value);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 初始化认证状态（从本地存储恢复）
  const initAuth = () => {
    if (process.client) {
      const savedToken = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("auth_user");

      if (savedToken && savedUser) {
        try {
          token.value = savedToken;
          user.value = JSON.parse(savedUser);
        } catch (err) {
          console.error("Failed to restore auth state:", err);
          clearAuth();
        }
      }
    }
  };

  // 登录
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<ApiResponse<LoginResponse>>(
        "/api/auth/login",
        {
          method: "POST",
          body: credentials,
        }
      );

      if (response.success && response.data) {
        user.value = response.data.user;
        token.value = response.data.token;

        // 保存到本地存储
        if (process.client) {
          localStorage.setItem("auth_token", response.data.token);
          localStorage.setItem("auth_user", JSON.stringify(response.data.user));
        }

        return true;
      } else {
        throw new Error(response.error || "Login failed");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Login failed";
      return false;
    } finally {
      loading.value = false;
    }
  };

  // 注册
  const register = async (userData: CreateUserRequest): Promise<boolean> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<ApiResponse<LoginResponse>>(
        "/api/auth/register",
        {
          method: "POST",
          body: userData,
        }
      );

      if (response.success && response.data) {
        user.value = response.data.user;
        token.value = response.data.token;

        // 保存到本地存储
        if (process.client) {
          localStorage.setItem("auth_token", response.data.token);
          localStorage.setItem("auth_user", JSON.stringify(response.data.user));
        }

        return true;
      } else {
        throw new Error(response.error || "Registration failed");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Registration failed";
      return false;
    } finally {
      loading.value = false;
    }
  };

  // 登出
  const logout = async () => {
    loading.value = true;

    try {
      await $fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearAuth();
      loading.value = false;
    }
  };

  // 清理认证状态
  const clearAuth = () => {
    user.value = null;
    token.value = null;
    error.value = null;

    if (process.client) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
  };

  // 检查认证状态
  const checkAuth = async (): Promise<boolean> => {
    if (!token.value) {
      return false;
    }

    try {
      const response = await $fetch<ApiResponse<User>>("/api/auth/me");

      if (response.success && response.data) {
        user.value = response.data;
        return true;
      } else {
        clearAuth();
        return false;
      }
    } catch (err) {
      clearAuth();
      return false;
    }
  };

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData };

      if (process.client) {
        localStorage.setItem("auth_user", JSON.stringify(user.value));
      }
    }
  };

  return {
    // 状态
    user: readonly(user),
    token: readonly(token),
    isAuthenticated,
    loading: readonly(loading),
    error: readonly(error),

    // 方法
    initAuth,
    login,
    register,
    logout,
    clearAuth,
    checkAuth,
    updateUser,
  };
});
