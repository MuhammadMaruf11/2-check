/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";

export const blogService = {
  // blogService.ts এ
  getAll: async (
    page = 1,
    limit = 12,
    status?: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "SCHEDULED" | "PUBLISHED" | "REJECTED",
    search = "",
    authorId?: string,
    tag?: string,
  ) => {
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status ? { status: status } : {}),
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
      ...(authorId ? { authorId } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
    };

    const [blogs, total] = await prisma.$transaction([
      prisma.blog.findMany({
        where,
        include: {
          author: { select: { name: true, image: true } },
          products: { include: { affiliateLinks: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: skip,
      }),
      prisma.blog.count({ where }),
    ]);

    return { blogs, total, totalPages: Math.ceil(total / limit) };
  },

  // Public - only ever returns posts that are actually live right now.
  // (Full due-date/scheduling semantics land in the author-workflow phase;
  // for now this simply never leaks DRAFT/PENDING_REVIEW/APPROVED/SCHEDULED/REJECTED posts.)
  getPublished: async (limit = 12) => {
    return prisma.blog.findMany({
      where: { status: "PUBLISHED" },
      include: { author: { select: { name: true, image: true } } },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      take: limit,
    });
  },

  getBySlug: async (slug: string) => {
    return prisma.blog.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true, image: true } },
        products: {
          select: {
            id: true,
            slug: true,
            name: true,
            brand: true,
            thumbnailUrl: true,
            shortDescription: true,
            rating: true,
            ratingCount: true,
            price: true,
            originalPrice: true,
            currency: true,
            category: { select: { name: true, slug: true } },
          },
        },
        // Comments are intentionally NOT included here - the public page
        // renders them via a client component that fetches its own
        // (already-moderation-filtered) list. Including them here would
        // fetch every comment on every page load just to discard it.
      },
    });
  },

  create: async (data: any) => {
    const { productIds, ...blogData } = data;

    return prisma.blog.create({
      data: {
        ...blogData,
        products: {
          connect: productIds?.map((id: string) => ({ id })) || [],
        },
      },
    });
  },

  updateStatus: async (
    id: string,
    status: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "SCHEDULED" | "PUBLISHED" | "REJECTED",
  ) => {
    return prisma.blog.update({
      where: { id },
      data: {
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      },
    });
  },

  // Full update - trusted callers only (the API route is responsible for stripping
  // any field a non-admin caller should not be able to set before this runs).
  update: async (id: string, data: any) => {
    const { productIds, ...blogData } = data;

    return prisma.blog.update({
      where: { id },
      data: {
        ...blogData,
        ...(productIds && {
          products: {
            set: productIds.map((id: string) => ({ id })),
          },
        }),
      },
    });
  },

  toggleFeatured: async (id: string) => {
    const blog = await prisma.blog.findUnique({ where: { id }, select: { isFeatured: true } });
    if (!blog) return null;
    return prisma.blog.update({ where: { id }, data: { isFeatured: !blog.isFeatured } });
  },

  delete: async (id: string) => {
    return prisma.blog.delete({ where: { id } });
  },
};
