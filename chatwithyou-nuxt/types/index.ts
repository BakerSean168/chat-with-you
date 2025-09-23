// 基础类型
export type ID = string;

// 角色相关类型
export enum CharacterCategory {
  HISTORICAL = "HISTORICAL",
  FICTIONAL = "FICTIONAL",
  CELEBRITY = "CELEBRITY",
  CUSTOM = "CUSTOM",
}

export interface Character {
  id: ID;
  name: string;
  avatar?: string;
  background: string;
  personality: string[];
  speakingStyle: string;
  quotes: string[];
  category: CharacterCategory;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCharacterRequest {
  name: string;
  avatar?: string;
  background: string;
  personality: string[];
  speakingStyle: string;
  quotes: string[];
  category: CharacterCategory;
}

export interface UpdateCharacterRequest
  extends Partial<CreateCharacterRequest> {
  id: ID;
}

// 用户相关类型
export interface User {
  id: ID;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// 消息相关类型
export enum MessageType {
  USER = "USER",
  AI = "AI",
}

export enum MessageStatus {
  SENDING = "sending",
  SENT = "sent",
  ERROR = "error",
}

export interface Message {
  id: ID;
  conversationId: ID;
  type: MessageType;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
}

export interface CreateMessageRequest {
  conversationId: ID;
  type: MessageType;
  content: string;
}

// 对话相关类型
export interface Conversation {
  id: ID;
  userId: ID;
  characterId: ID;
  character?: Character;
  messages?: Message[];
  title?: string;
  lastMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConversationRequest {
  userId: ID;
  characterId: ID;
  title?: string;
}

export interface ConversationSummary {
  id: ID;
  character: {
    id: ID;
    name: string;
    avatar?: string;
  };
  lastMessage?: string;
  messageCount: number;
  updatedAt: Date;
}

// AI 相关类型
export interface AIPrompt {
  systemPrompt: string;
  messages: AIMessage[];
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  details?: any;
}

// 分页查询参数
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CharacterQueryParams extends PaginationParams {
  category?: CharacterCategory;
  search?: string;
  isActive?: boolean;
}

export interface ConversationQueryParams extends PaginationParams {
  userId?: ID;
  characterId?: ID;
}

// WebSocket 相关类型
export interface SocketMessage {
  type: "message" | "typing" | "stop_typing" | "join" | "leave";
  data?: any;
}

export interface TypingEvent {
  conversationId: ID;
  userId: ID;
  isTyping: boolean;
}

// 应用状态类型
export interface AppState {
  user?: User;
  isAuthenticated: boolean;
  currentConversation?: Conversation;
  characters: Character[];
  conversations: ConversationSummary[];
}

// 聊天状态类型
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  error?: string;
}

// UI 状态类型
export interface UIState {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
}

// 表单验证错误类型
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string[];
}
