<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <!-- 头部 -->
            <div>
                <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-600">
                    <Icon name="heroicons:user-plus" class="h-8 w-8 text-white" />
                </div>
                <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    注册 ChatWithYou 账号
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    已有账号？
                    <NuxtLink to="/auth/login" class="font-medium text-indigo-600 hover:text-indigo-500">
                        立即登录
                    </NuxtLink>
                </p>
            </div>

            <!-- 注册表单 -->
            <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
                <div class="space-y-4">
                    <!-- 姓名输入 -->
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700">
                            用户名
                        </label>
                        <input id="name" v-model="form.name" name="name" type="text" autocomplete="name" required
                            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="请输入用户名" :class="{
                                'border-red-300': errors.name,
                                'focus:ring-red-500 focus:border-red-500': errors.name,
                            }" @blur="validateName" />
                        <p v-if="errors.name" class="mt-1 text-sm text-red-600">
                            {{ errors.name }}
                        </p>
                    </div>

                    <!-- 邮箱输入 -->
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700">
                            邮箱地址
                        </label>
                        <input id="email" v-model="form.email" name="email" type="email" autocomplete="email" required
                            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="请输入邮箱地址" :class="{
                                'border-red-300': errors.email,
                                'focus:ring-red-500 focus:border-red-500': errors.email,
                            }" @blur="validateEmail" />
                        <p v-if="errors.email" class="mt-1 text-sm text-red-600">
                            {{ errors.email }}
                        </p>
                    </div>

                    <!-- 密码输入 -->
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">
                            密码
                        </label>
                        <div class="relative mt-1">
                            <input id="password" v-model="form.password" name="password"
                                :type="showPassword ? 'text' : 'password'" autocomplete="new-password" required
                                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="请输入密码（至少6个字符）" :class="{
                                    'border-red-300': errors.password,
                                    'focus:ring-red-500 focus:border-red-500': errors.password,
                                }" @blur="validatePassword" />
                            <button type="button" class="absolute inset-y-0 right-0 pr-3 flex items-center"
                                @click="showPassword = !showPassword">
                                <Icon :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
                                    class="h-5 w-5 text-gray-400" />
                            </button>
                        </div>
                        <p v-if="errors.password" class="mt-1 text-sm text-red-600">
                            {{ errors.password }}
                        </p>
                    </div>

                    <!-- 确认密码输入 -->
                    <div>
                        <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                            确认密码
                        </label>
                        <div class="relative mt-1">
                            <input id="confirmPassword" v-model="form.confirmPassword" name="confirmPassword"
                                :type="showConfirmPassword ? 'text' : 'password'" autocomplete="new-password" required
                                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="请再次输入密码" :class="{
                                    'border-red-300': errors.confirmPassword,
                                    'focus:ring-red-500 focus:border-red-500': errors.confirmPassword,
                                }" @blur="validateConfirmPassword" />
                            <button type="button" class="absolute inset-y-0 right-0 pr-3 flex items-center"
                                @click="showConfirmPassword = !showConfirmPassword">
                                <Icon :name="showConfirmPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
                                    class="h-5 w-5 text-gray-400" />
                            </button>
                        </div>
                        <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
                            {{ errors.confirmPassword }}
                        </p>
                    </div>
                </div>

                <!-- 错误消息 -->
                <div v-if="registerError" class="rounded-md bg-red-50 p-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <Icon name="heroicons:exclamation-circle" class="h-5 w-5 text-red-400" />
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-red-800">注册失败</h3>
                            <div class="mt-2 text-sm text-red-700">
                                <p>{{ registerError }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 提交按钮 -->
                <div>
                    <button type="submit"
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="!isFormValid || isLoading">
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <Icon v-if="isLoading" name="svg-spinners:3-dots-bounce" class="h-5 w-5 text-indigo-300" />
                            <Icon v-else name="heroicons:user-plus"
                                class="h-5 w-5 text-indigo-300 group-hover:text-indigo-400" />
                        </span>
                        {{ isLoading ? '注册中...' : '注册账号' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { RegisterRequest } from "~/types";

definePageMeta({
    layout: false,
});

// 状态管理
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// 表单数据
const form = reactive<RegisterRequest>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
});

// UI状态
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);
const registerError = ref("");

// 表单验证
const errors = reactive({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
});

// 验证用户名
const validateName = () => {
    if (!form.name) {
        errors.name = "用户名不能为空";
    } else if (form.name.length < 2) {
        errors.name = "用户名至少2个字符";
    } else if (form.name.length > 20) {
        errors.name = "用户名最多20个字符";
    } else {
        errors.name = "";
    }
};

// 验证邮箱
const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
        errors.email = "邮箱地址不能为空";
    } else if (!emailRegex.test(form.email)) {
        errors.email = "请输入有效的邮箱地址";
    } else {
        errors.email = "";
    }
};

// 验证密码
const validatePassword = () => {
    if (!form.password) {
        errors.password = "密码不能为空";
    } else if (form.password.length < 6) {
        errors.password = "密码长度至少6个字符";
    } else if (form.password.length > 50) {
        errors.password = "密码长度最多50个字符";
    } else {
        errors.password = "";
    }

    // 如果确认密码已经输入，重新验证
    if (form.confirmPassword) {
        validateConfirmPassword();
    }
};

// 验证确认密码
const validateConfirmPassword = () => {
    if (!form.confirmPassword) {
        errors.confirmPassword = "请确认密码";
    } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = "两次输入的密码不一致";
    } else {
        errors.confirmPassword = "";
    }
};

// 表单是否有效
const isFormValid = computed(() => {
    return (
        form.name &&
        form.email &&
        form.password &&
        form.confirmPassword &&
        !errors.name &&
        !errors.email &&
        !errors.password &&
        !errors.confirmPassword
    );
});

// 处理注册
const handleRegister = async () => {
    if (!isFormValid.value) {
        validateName();
        validateEmail();
        validatePassword();
        validateConfirmPassword();
        return;
    }

    isLoading.value = true;
    registerError.value = "";

    try {
        const success = await authStore.register(form);

        if (success) {
            // 注册成功，重定向到目标页面或首页
            const redirect = (route.query.redirect as string) || "/";
            await navigateTo(redirect);
        } else {
            registerError.value = authStore.error || "注册失败，请稍后重试";
        }
    } catch (error: any) {
        console.error("注册错误:", error);
        registerError.value = error.message || "注册失败，请稍后重试";
    } finally {
        isLoading.value = false;
    }
};

// 如果已经登录，重定向到首页
onMounted(() => {
    authStore.initAuth();
    if (authStore.isAuthenticated) {
        navigateTo("/");
    }
});
</script>

<style scoped>
/* 添加一些自定义样式 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>