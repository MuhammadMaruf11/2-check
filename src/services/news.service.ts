import prisma from "@/lib/prisma";

export const newsService = {
  getAll: async () => {
    return prisma.news.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  getBySlug: async (slug: string) => {
    return prisma.news.findUnique({
      where: { slug },
    });
  },

  create: async (data: {
    title: string;
    slug: string;
    content: string;
    imageUrl?: string;
  }) => {
    return prisma.news.create({ data });
  },

  update: async (
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      content: string;
      imageUrl: string;
    }>
  ) => {
    return prisma.news.update({ where: { id }, data });
  },

  delete: async (id: string) => {
    return prisma.news.delete({ where: { id } });
  },
};