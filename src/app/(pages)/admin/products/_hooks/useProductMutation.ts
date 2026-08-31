/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

export const useProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slug,
      data,
      method,
    }: {
      slug?: string;
      data?: any;
      method: "POST" | "PATCH" | "DELETE";
    }) => {
      const url = slug ? `/products/${slug}` : "/products";
      const response = await apiClient({ method, url, data });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product"] });
    },
  });
};

// Generic sub-resource mutation for affiliate links / videos / expert reviews.
// basePath examples: "/products/iphone-17/affiliate-links", "/products/iphone-17/videos"
export const useSubResourceMutation = (productSlug: string, resource: "affiliate-links" | "videos" | "expert-reviews") => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
      method,
    }: {
      id?: string;
      data?: any;
      method: "POST" | "PATCH" | "DELETE";
    }) => {
      const url = id
        ? `/products/${productSlug}/${resource}/${id}`
        : `/products/${productSlug}/${resource}`;
      const response = await apiClient({ method, url, data });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product", productSlug] });
    },
  });
};
