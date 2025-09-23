import type {
  Character,
  Conversation,
  Message,
  User,
  ApiResponse,
  PaginatedResponse,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  CreateConversationRequest,
  CreateMessageRequest,
  CharacterQueryParams,
  ConversationQueryParams,
  AIResponse,
} from "~/types";

// 角色相关 API 契约
export interface CharacterEndpoints {
  "GET /api/characters": {
    query?: CharacterQueryParams;
    response: PaginatedResponse<Character>;
  };

  "GET /api/characters/[id]": {
    params: { id: string };
    response: ApiResponse<Character>;
  };

  "POST /api/characters": {
    body: CreateCharacterRequest;
    response: ApiResponse<Character>;
  };

  "PUT /api/characters/[id]": {
    params: { id: string };
    body: UpdateCharacterRequest;
    response: ApiResponse<Character>;
  };

  "DELETE /api/characters/[id]": {
    params: { id: string };
    response: ApiResponse<void>;
  };
}

// 用户相关 API 契约
export interface AuthEndpoints {
  "POST /api/auth/register": {
    body: CreateUserRequest;
    response: ApiResponse<LoginResponse>;
  };

  "POST /api/auth/login": {
    body: LoginRequest;
    response: ApiResponse<LoginResponse>;
  };

  "POST /api/auth/logout": {
    response: ApiResponse<void>;
  };

  "GET /api/auth/me": {
    response: ApiResponse<User>;
  };
}

// 对话相关 API 契约
export interface ConversationEndpoints {
  "GET /api/conversations": {
    query?: ConversationQueryParams;
    response: PaginatedResponse<Conversation>;
  };

  "GET /api/conversations/[id]": {
    params: { id: string };
    response: ApiResponse<Conversation>;
  };

  "POST /api/conversations": {
    body: CreateConversationRequest;
    response: ApiResponse<Conversation>;
  };

  "DELETE /api/conversations/[id]": {
    params: { id: string };
    response: ApiResponse<void>;
  };
}

// 消息相关 API 契约
export interface MessageEndpoints {
  "GET /api/conversations/[id]/messages": {
    params: { id: string };
    query?: { page?: number; limit?: number };
    response: PaginatedResponse<Message>;
  };

  "POST /api/conversations/[id]/messages": {
    params: { id: string };
    body: { content: string };
    response: ApiResponse<Message>;
  };
}

// AI 相关 API 契约
export interface AIEndpoints {
  "POST /api/ai/chat": {
    body: {
      message: string;
      conversationId: string;
      characterId: string;
    };
    response: ApiResponse<AIResponse>;
  };
}

// 完整 API 契约
export type ApiContract = CharacterEndpoints &
  AuthEndpoints &
  ConversationEndpoints &
  MessageEndpoints &
  AIEndpoints;

// 类型安全的 API 客户端类型
export type ApiClient = {
  get: <T extends keyof ApiContract>(
    endpoint: T,
    ...args: ApiContract[T] extends { query?: infer Q; params?: infer P }
      ? [params?: P, query?: Q]
      : ApiContract[T] extends { query?: infer Q }
      ? [query?: Q]
      : ApiContract[T] extends { params?: infer P }
      ? [params?: P]
      : []
  ) => Promise<ApiContract[T]["response"]>;

  post: <T extends keyof ApiContract>(
    endpoint: T,
    ...args: ApiContract[T] extends { body: infer B; params?: infer P }
      ? [params?: P, body?: B]
      : ApiContract[T] extends { body: infer B }
      ? [body?: B]
      : ApiContract[T] extends { params?: infer P }
      ? [params?: P]
      : []
  ) => Promise<ApiContract[T]["response"]>;

  put: <T extends keyof ApiContract>(
    endpoint: T,
    ...args: ApiContract[T] extends { body: infer B; params?: infer P }
      ? [params?: P, body?: B]
      : ApiContract[T] extends { body: infer B }
      ? [body?: B]
      : ApiContract[T] extends { params?: infer P }
      ? [params?: P]
      : []
  ) => Promise<ApiContract[T]["response"]>;

  delete: <T extends keyof ApiContract>(
    endpoint: T,
    ...args: ApiContract[T] extends { params?: infer P } ? [params?: P] : []
  ) => Promise<ApiContract[T]["response"]>;
};
