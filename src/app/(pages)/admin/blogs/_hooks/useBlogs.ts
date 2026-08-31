import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { BlogWithAuthor } from "../_types/blog";

export const useBlogs = (page: number, search: string) => {
  return useQuery({
    queryKey: ["blogs", page, search],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/blogs?page=${page}&limit=12&search=${search}`,
      );
      return data as { blogs: BlogWithAuthor[]; total: number };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
};
