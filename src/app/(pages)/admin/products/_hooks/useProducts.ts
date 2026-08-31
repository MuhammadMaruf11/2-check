import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { AdminProduct } from "../_types/product";

export const useAdminProducts = (page: number, search: string, status?: string) => {
  return useQuery({
    queryKey: ["admin-products", page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
        search,
        ...(status && status !== "all" ? { status } : {}),
      });
      const { data } = await apiClient.get(`/products?${params.toString()}`);
      return data as { products: AdminProduct[]; total: number; totalPages: number };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });
};

export const useAdminProduct = (slug: string) => {
  return useQuery({
    queryKey: ["admin-product", slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/products/${slug}`);
      return data as AdminProduct;
    },
    enabled: !!slug,
  });
};
