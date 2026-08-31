import prisma from "@/lib/prisma";

export const contactService = {
  create: async (data: { name: string; email: string; subject?: string; message: string }) => {
    return prisma.contactMessage.create({ data });
  },

  getAll: async (params: { page?: number; limit?: number; onlyUnread?: boolean } = {}) => {
    const { page = 1, limit = 20, onlyUnread = false } = params;
    const skip = (page - 1) * limit;
    const where = onlyUnread ? { isRead: false } : {};

    const [messages, total] = await prisma.$transaction([
      prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip }),
      prisma.contactMessage.count({ where }),
    ]);

    return { messages, total, totalPages: Math.ceil(total / limit) };
  },

  markAsRead: async (id: string) => {
    return prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
  },

  delete: async (id: string) => {
    return prisma.contactMessage.delete({ where: { id } });
  },
};
