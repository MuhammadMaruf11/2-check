import prisma from "@/lib/prisma";

export const newsletterService = {
  subscribe: async (email: string) => {
    return prisma.newsletter.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  },

  getAll: async () => {
    return prisma.newsletter.findMany({ orderBy: { createdAt: "desc" } });
  },

  unsubscribe: async (email: string) => {
    return prisma.newsletter.delete({ where: { email } });
  },

  count: async () => {
    return prisma.newsletter.count();
  },
};
