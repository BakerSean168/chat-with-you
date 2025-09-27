export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // 初始化认证状态
  if (process.client) {
    authStore.initAuth();
  }

  // 如果用户未登录，重定向到登录页面
  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: "/auth/login",
      query: { redirect: to.fullPath },
    });
  }
});
