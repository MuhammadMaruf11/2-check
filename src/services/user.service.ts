import prisma from "@/lib/prisma";

export const userService = {
  getAll: async (params: { page?: number; limit?: number; role?: string; search?: string } = {}) => {
    const { page = 1, limit = 20, role, search } = params;
    const skip = (page - 1) * limit;

    const where = {
      ...(role && role !== "all" ? { role: role as "USER" | "AUTHOR" | "ADMIN" } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          image: true,
          createdAt: true,
          _count: { select: { blogs: true, comments: true, reviews: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, totalPages: Math.ceil(total / limit) };
  },

  updateRole: async (id: string, role: "USER" | "AUTHOR" | "ADMIN") => {
    return prisma.user.update({ where: { id }, data: { role } });
  },

  toggleActive: async (id: string) => {
    const user = await prisma.user.findUnique({ where: { id }, select: { isActive: true } });
    if (!user) return null;
    return prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },
};
