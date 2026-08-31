import prisma from "@/lib/prisma";

export const categoryService = {
  getAll: async () => {
    return prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
  },

  // Simple substring search used by the global search page.
  search: async (query: string, limit = 5) => {
    return prisma.category.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      include: { _count: { select: { products: { where: { isPublished: true } } } } },
      take: limit,
    });
  },

  getAllWithPublishedProducts: async () => {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: { where: { isPublished: true } } } } },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
    // Only surface categories that actually have at least one published product.
    return categories.filter((c: { _count: { products: number } }) => c._count.products > 0);
  },

  getBySlug: async (slug: string) => {
    return prisma.category.findUnique({ where: { slug } });
  },

  getById: async (id: string) => {
    return prisma.category.findUnique({ where: { id } });
  },

  create: async (data: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    displayOrder?: number;
  }) => {
    return prisma.category.create({ data });
  },

  update: async (
    id: string,
    data: Partial<{ name: string; slug: string; description: string; icon: string; displayOrder: number }>,
  ) => {
    return prisma.category.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.category.delete({ where: { id } });
  },
};
