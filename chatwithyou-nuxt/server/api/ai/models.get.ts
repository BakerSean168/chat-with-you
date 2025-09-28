import type { ApiResponse } from "~/types";

export default defineEventHandler(
  async (event): Promise<ApiResponse<{ models: any[] }>> => {
    try {
      const runtimeConfig = useRuntimeConfig();
      const baseUrl =
        runtimeConfig.qiniuBaseUrl || runtimeConfig.qiniuBackupUrl;

      if (!baseUrl || !runtimeConfig.qiniuApiKey) {
        throw createError({
          statusCode: 500,
          statusMessage: "七牛云AI配置不完整",
        });
      }

      // 调用七牛云AI获取模型列表
      const response = (await $fetch(`${baseUrl}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${runtimeConfig.qiniuApiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "ChatWithYou/1.0",
        },
        timeout: 10000, // 10秒超时
      })) as any;

      if (response?.data) {
        return {
          success: true,
          data: {
            models: response.data,
          },
        };
      }

      throw new Error("获取模型列表失败");
    } catch (error: any) {
      console.error("获取AI模型列表失败:", error);

      // 返回一些默认的推荐模型（基于用户测试发现的可用模型）
      const defaultModels = [
        {
          id: "openai/gpt-5",
          name: "GPT-5",
          description: "OpenAI最新一代模型GPT-5，具有最强的推理和对话能力",
          owned_by: "openai",
          object: "model",
          created: 1758927890,
        },
        {
          id: "deepseek-v3",
          name: "DeepSeek V3",
          description: "DeepSeek最新版本，适合对话和代码生成",
          owned_by: "deepseek",
          object: "model",
          created: 1640995200,
        },
        {
          id: "qwen2.5-72b-instruct",
          name: "Qwen2.5 72B Instruct",
          description: "通义千问2.5 72B版本，适合对话和指令跟随",
          owned_by: "alibaba",
          object: "model",
          created: 1640995200,
        },
        {
          id: "qwen2.5-14b-instruct",
          name: "Qwen2.5 14B Instruct",
          description: "通义千问2.5 14B版本，平衡性能和速度",
          owned_by: "alibaba",
          object: "model",
          created: 1640995200,
        },
        {
          id: "chatglm3-6b",
          name: "ChatGLM3 6B",
          description: "清华智谱AI的ChatGLM3模型",
          owned_by: "zhipuai",
          object: "model",
          created: 1640995200,
        },
      ];
      return {
        success: true,
        data: {
          models: defaultModels,
        },
        message: "使用默认模型列表（获取最新列表失败）",
      };
    }
  }
);
