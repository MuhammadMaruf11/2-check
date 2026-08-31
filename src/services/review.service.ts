import prisma from "@/lib/prisma";
import { ReviewStatus } from "@prisma/client";

async function recalculateProductRating(productId: string) {
  const result = await prisma.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: result._avg.rating ?? 0,
      ratingCount: result._count.rating,
    },
  });
}

export const reviewService = {
  // Public product page: only approved reviews.
  getByProduct: async (productId: string, opts: { onlyApproved?: boolean } = { onlyApproved: true }) => {
    return prisma.review.findMany({
      where: { productId, ...(opts.onlyApproved ? { status: "APPROVED" } : {}) },
      include: { user: { select: { name: true, image: true } } },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });
  },

  // Admin moderation queue - all statuses, paginated, optionally filtered.
  getForAdmin: async (params: { page?: number; limit?: number; status?: ReviewStatus; productId?: string } = {}) => {
    const { page = 1, limit = 20, status, productId } = params;
    const skip = (page - 1) * limit;
    const where = {
      ...(status ? { status } : {}),
      ...(productId ? { productId } : {}),
    };

    const [reviews, total] = await prisma.$transaction([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { name: true, image: true, email: true } },
          product: { select: { name: true, slug: true, thumbnailUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, total, totalPages: Math.ceil(total / limit) };
  },

  // Homepage "Reader Reviews" - a handful of featured, approved reviews across all products.
  getFeaturedAcrossProducts: async (limit = 6) => {
    return prisma.review.findMany({
      where: { status: "APPROVED", isFeatured: true },
      include: {
        user: { select: { name: true, image: true } },
        product: { select: { name: true, slug: true, thumbnailUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  // Owner-only - a user's own submitted reviews across all products, any status.
  getByUser: async (userId: string, params: { page?: number; limit?: number } = {}) => {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;
    const where = { userId };

    const [reviews, total] = await prisma.$transaction([
      prisma.review.findMany({
        where,
        include: { product: { select: { name: true, slug: true, thumbnailUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, total, totalPages: Math.ceil(total / limit) };
  },

  getAverageRating: async (productId: string) => {
    const result = await prisma.review.aggregate({
      where: { productId, status: "APPROVED" },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return { average: result._avg.rating ?? 0, total: result._count.rating };
  },

  // A user can only review a given product once - prevents obvious duplicate/spam submissions.
  hasReviewed: async (userId: string, productId: string) => {
    const review = await prisma.review.findUnique({
      where: { productId_userId: { productId, userId } },
    });
    return !!review;
  },

  create: async (data: { rating: number; title?: string; comment: string; productId: string; userId: string }) => {
    return prisma.review.create({
      data,
      include: { user: { select: { name: true, image: true } } },
    });
  },

  // Admin moderation: approve / reject a pending review.
  moderate: async (id: string, status: ReviewStatus) => {
    const review = await prisma.review.update({ where: { id }, data: { status } });
    await recalculateProductRating(review.productId);
    return review;
  },

  toggleFeature: async (id: string) => {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return null;
    return prisma.review.update({ where: { id }, data: { isFeatured: !review.isFeatured } });
  },

  // Kept for backwards compatibility with any existing "verified purchase" UI.
  toggleVerify: async (id: string) => {
    const review = await prisma.review.findUnique({ where: { id } });
    return prisma.review.update({ where: { id }, data: { isVerified: !review?.isVerified } });
  },

  delete: async (id: string) => {
    const review = await prisma.review.delete({ where: { id } });
    if (review.status === "APPROVED") {
      await recalculateProductRating(review.productId);
    }
    return review;
  },

  findById: async (id: string) => {
    return prisma.review.findUnique({ where: { id } });
  },
};
