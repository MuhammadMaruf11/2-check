import prisma from "@/lib/prisma";

export const commentService = {
  // Public - hidden comments are excluded by default.
  getByBlog: async (blogId: string, opts: { includeHidden?: boolean } = {}) => {
    return prisma.comment.findMany({
      where: { blogId, ...(opts.includeHidden ? {} : { isHidden: false }) },
      include: {
        user: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // Admin moderation queue - every comment across every post, paginated.
  getForAdmin: async (params: { page?: number; limit?: number; onlyHidden?: boolean } = {}) => {
    const { page = 1, limit = 20, onlyHidden = false } = params;
    const skip = (page - 1) * limit;
    const where = onlyHidden ? { isHidden: true } : {};

    const [comments, total] = await prisma.$transaction([
      prisma.comment.findMany({
        where,
        include: {
          user: { select: { name: true, image: true, email: true } },
          blog: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.comment.count({ where }),
    ]);

    return { comments, total, totalPages: Math.ceil(total / limit) };
  },

  // Author moderation - comments on posts a specific author wrote.
  getForAuthor: async (authorId: string, params: { page?: number; limit?: number } = {}) => {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;
    const where = { blog: { authorId } };

    const [comments, total] = await prisma.$transaction([
      prisma.comment.findMany({
        where,
        include: {
          user: { select: { name: true, image: true } },
          blog: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.comment.count({ where }),
    ]);

    return { comments, total, totalPages: Math.ceil(total / limit) };
  },

  // Owner-only - a user's own submitted comments (distinct from "mine=true",
  // which lists comments *on an author's posts* for post moderation).
  getAuthoredByUser: async (userId: string, params: { page?: number; limit?: number } = {}) => {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;
    const where = { userId };

    const [comments, total] = await prisma.$transaction([
      prisma.comment.findMany({
        where,
        include: { blog: { select: { title: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.comment.count({ where }),
    ]);

    return { comments, total, totalPages: Math.ceil(total / limit) };
  },

  create: async (data: {
    content: string;
    blogId: string;
    userId?: string;
    guestName?: string;
    guestEmail?: string;
  }) => {
    if (!data.userId && !data.guestName) {
      throw new Error("Guest name is required");
    }

    return prisma.comment.create({
      data,
      include: {
        user: { select: { name: true, image: true } },
      },
    });
  },

  // Owner-only content edit.
  update: async (id: string, content: string) => {
    return prisma.comment.update({
      where: { id },
      data: { content },
      include: { user: { select: { name: true, image: true } } },
    });
  },

  // Admin (or the post's own author) hide/unhide toggle.
  toggleHidden: async (id: string) => {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return null;
    return prisma.comment.update({ where: { id }, data: { isHidden: !comment.isHidden } });
  },

  findById: async (id: string) => {
    return prisma.comment.findUnique({ where: { id }, include: { blog: { select: { authorId: true } } } });
  },

  delete: async (id: string) => {
    return prisma.comment.delete({ where: { id } });
  },
};
