export default defineEventHandler(async (event) => {
  try {
    const runtimeConfig = useRuntimeConfig();
    const { qiniuApiKey, qiniuBaseUrl, qiniuModelId } = runtimeConfig;

    // 检查配置
    if (!qiniuApiKey || !qiniuBaseUrl || !qiniuModelId) {
      return {
        success: false,
        error: "七牛云AI配置不完整",
        config: {
          hasApiKey: !!qiniuApiKey,
          hasBaseUrl: !!qiniuBaseUrl,
          hasModelId: !!qiniuModelId,
        },
      };
    }

    // 测试简单的API调用
    const testResponse = (await $fetch(`${qiniuBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${qiniuApiKey}`,
        "Content-Type": "application/json",
      },
      body: {
        model: qiniuModelId,
        messages: [
          { role: "system", content: "你是一个友好的AI助手。" },
          { role: "user", content: "请简单介绍一下你自己。" },
        ],
        temperature: 0.7,
        max_tokens: 100,
        stream: false,
      },
      timeout: 30000,
    })) as any;

    return {
      success: true,
      message: "七牛云AI连接成功",
      config: {
        baseUrl: qiniuBaseUrl,
        modelId: qiniuModelId,
      },
      testResponse: {
        content: testResponse?.choices?.[0]?.message?.content || "无响应内容",
        hasChoices: !!testResponse?.choices,
        responseKeys: Object.keys(testResponse || {}),
      },
    };
  } catch (error: any) {
    console.error("七牛云AI测试失败:", error);

    return {
      success: false,
      error: error.message || "未知错误",
      details: {
        statusCode: error.statusCode,
        statusMessage: error.statusMessage,
        data: error.data,
      },
    };
  }
});
