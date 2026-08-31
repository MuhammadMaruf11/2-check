/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

export const useBlogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      slug,
      data,
      method,
    }: {
      id?: string;
      slug?: string; 
      data?: any;
      method: "POST" | "PATCH" | "DELETE";
    }) => {
      const url = slug ? `/blogs/${slug}` : id ? `/blogs/${id}` : "/blogs";
      
      const response = await apiClient({ 
        method, 
        url, 
        data 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};