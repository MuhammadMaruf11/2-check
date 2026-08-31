/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

export const useReviewMutation = (productSlug?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      method,
    }: {
      id: string;
      data?: any;
      method: "PATCH" | "DELETE";
    }) => {
      const response = await apiClient({ method, url: `/reviews/${id}`, data });
      return response.data;
    },
    onSuccess: () => {
      if (productSlug) queryClient.invalidateQueries({ queryKey: ["admin-product", productSlug] });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });
};
