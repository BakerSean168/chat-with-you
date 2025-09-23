import { z } from "zod";

// 角色相关 Schema
export const CharacterCategorySchema = z.enum([
  "HISTORICAL",
  "FICTIONAL",
  "CELEBRITY",
  "CUSTOM",
]);

export const CreateCharacterSchema = z.object({
  name: z
    .string()
    .min(1, "角色名称不能为空")
    .max(50, "角色名称不能超过50个字符"),
  avatar: z.string().url("请输入有效的头像URL").optional(),
  background: z
    .string()
    .min(10, "角色背景至少需要10个字符")
    .max(500, "角色背景不能超过500个字符"),
  personality: z
    .array(z.string())
    .min(1, "至少需要一个性格特征")
    .max(10, "性格特征不能超过10个"),
  speakingStyle: z
    .string()
    .min(10, "说话风格描述至少需要10个字符")
    .max(200, "说话风格描述不能超过200个字符"),
  quotes: z.array(z.string()).max(20, "经典语录不能超过20条"),
  category: CharacterCategorySchema,
});

export const UpdateCharacterSchema = CreateCharacterSchema.partial().extend({
  id: z.string().min(1, "ID不能为空"),
});

// 用户相关 Schema
export const CreateUserSchema = z.object({
  email: z
    .string()
    .email("请输入有效的邮箱地址")
    .max(100, "邮箱地址不能超过100个字符"),
  name: z.string().min(1, "姓名不能为空").max(50, "姓名不能超过50个字符"),
  password: z
    .string()
    .min(6, "密码至少需要6个字符")
    .max(100, "密码不能超过100个字符")
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, "密码必须包含字母和数字"),
  avatar: z.string().url("请输入有效的头像URL").optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "密码不能为空"),
});

// 消息相关 Schema
export const MessageTypeSchema = z.enum(["USER", "AI"]);

export const CreateMessageSchema = z.object({
  conversationId: z.string().min(1, "对话ID不能为空"),
  type: MessageTypeSchema,
  content: z
    .string()
    .min(1, "消息内容不能为空")
    .max(2000, "消息内容不能超过2000个字符"),
});

// 对话相关 Schema
export const CreateConversationSchema = z.object({
  userId: z.string().min(1, "用户ID不能为空"),
  characterId: z.string().min(1, "角色ID不能为空"),
  title: z.string().max(100, "标题不能超过100个字符").optional(),
});

// 分页查询 Schema
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const CharacterQuerySchema = PaginationSchema.extend({
  category: CharacterCategorySchema.optional(),
  search: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
});

export const ConversationQuerySchema = PaginationSchema.extend({
  userId: z.string().optional(),
  characterId: z.string().optional(),
});

// 类型推断
export type CreateCharacterRequest = z.infer<typeof CreateCharacterSchema>;
export type UpdateCharacterRequest = z.infer<typeof UpdateCharacterSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type CreateMessageRequest = z.infer<typeof CreateMessageSchema>;
export type CreateConversationRequest = z.infer<
  typeof CreateConversationSchema
>;
export type CharacterQueryParams = z.infer<typeof CharacterQuerySchema>;
export type ConversationQueryParams = z.infer<typeof ConversationQuerySchema>;
