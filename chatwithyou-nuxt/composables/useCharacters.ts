import type {
  Character,
  CharacterQueryParams,
  ApiResponse,
  PaginatedResponse,
} from "~/types";

export const useCharacters = () => {
  // 响应式状态
  const characters = ref<Character[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 获取角色列表
  const fetchCharacters = async (
    params?: CharacterQueryParams
  ): Promise<Character[]> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<PaginatedResponse<Character>>(
        "/api/characters",
        {
          query: params,
        }
      );

      if (response.success && response.data) {
        characters.value = response.data;
        return response.data;
      } else {
        throw new Error(response.error || "Failed to fetch characters");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 获取单个角色
  const fetchCharacter = async (id: string): Promise<Character | null> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<ApiResponse<Character>>(
        `/api/characters/${id}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || "Character not found");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      return null;
    } finally {
      loading.value = false;
    }
  };

  // 搜索角色
  const searchCharacters = async (query: string): Promise<Character[]> => {
    return await fetchCharacters({ search: query });
  };

  // 按分类获取角色
  const getCharactersByCategory = async (
    category: string
  ): Promise<Character[]> => {
    return await fetchCharacters({ category: category as any });
  };

  // 从本地状态查找角色
  const findCharacter = (id: string): Character | undefined => {
    return characters.value.find((char) => char.id === id);
  };

  // 获取角色分类统计
  const getCategoryStats = () => {
    const stats = characters.value.reduce((acc, char) => {
      acc[char.category] = (acc[char.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return stats;
  };

  return {
    // 状态
    characters: readonly(characters),
    loading: readonly(loading),
    error: readonly(error),

    // 方法
    fetchCharacters,
    fetchCharacter,
    searchCharacters,
    getCharactersByCategory,
    findCharacter,
    getCategoryStats,
  };
};
