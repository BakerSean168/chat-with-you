export default defineNuxtConfig({
  devtools: { enabled: true },

  // 兼容性日期设置
  compatibilityDate: "2025-09-23",

  // CSS框架
  css: ["~/assets/css/main.css"],

  // 模块配置
  modules: ["@nuxt/ui", "@pinia/nuxt", "@vueuse/nuxt", "@sidebase/nuxt-auth"],

  // TypeScript配置
  typescript: {
    strict: true,
    typeCheck: false, // 可以根据需要启用
  },

  // 运行时配置
  runtimeConfig: {
    // 服务端私有配置
    openaiApiKey: process.env.OPENAI_API_KEY,
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    authSecret: process.env.NUXT_AUTH_SECRET,

    // 公共配置 (暴露给客户端)
    public: {
      apiBase: "/api",
      appUrl: process.env.NUXT_PUBLIC_APP_URL,
    },
  },

  // 页面配置
  pages: true,

  // Nitro服务端配置
  nitro: {
    experimental: {
      wasm: true,
    },
  },

  // 构建配置
  build: {
    transpile: ["socket.io-client"],
  },

  // Pinia配置
  pinia: {
    storesDirs: ["./stores/**"],
  },

  // UI配置
  ui: {
    global: true,
  },

  // VueUse配置
  vueuse: {
    ssrHandlers: true,
  },
});
