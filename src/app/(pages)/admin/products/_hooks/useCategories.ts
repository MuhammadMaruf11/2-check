import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { CategoryOption } from "../_types/product";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await apiClient.get("/categories");
      return data as (CategoryOption & { _count: { products: number } })[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductsForSelect = () => {
  return useQuery({
    queryKey: ["products-select"],
    queryFn: async () => {
      const { data } = await apiClient.get("/products/select");
      return data as { id: string; name: string; slug: string; thumbnailUrl?: string | null }[];
    },
    staleTime: 5 * 60 * 1000,
  });
};
