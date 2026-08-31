import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import DOMPurify from "isomorphic-dompurify";

const sanitizeHtml = (html: string) =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "blockquote",
      "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "style", "class"],
  });

const publicListInclude = {
  category: true,
  affiliateLinks: {
    where: { isActive: true },
    orderBy: { displayOrder: "asc" as const },
  },
};

const relatedProductSelect = {
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
} as const;

const fullDetailInclude = {
  category: true,
  specifications: { orderBy: { displayOrder: "asc" as const } },
  affiliateLinks: { orderBy: { displayOrder: "asc" as const } },
  videoReviews: { orderBy: { displayOrder: "asc" as const } },
  expertReviews: { orderBy: { displayOrder: "asc" as const } },
  // Customer reviews are intentionally NOT included here - the public product
  // page renders them via a client component (ProductReviews) that fetches
  // its own already-moderation-filtered list from /api/reviews. Including
  // them here would fetch every review (including pending/rejected ones) on
  // every page load just to discard the result.
  blogs: {
    select: {
      id: true,
      slug: true,
      title: true,
      coverImage: true,
      status: true,
    },
  },
  relatedTo: { select: relatedProductSelect },
  relatedFrom: { select: relatedProductSelect },
};

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  brand?: string;
  isFeatured?: boolean;
  /** When false (default for public callers), only published products are returned. */
  includeUnpublished?: boolean;
  sort?: "newest" | "rating" | "priceAsc" | "priceDesc" | "name";
}

function extractYoutubeId(url: string): string | undefined {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
  );
  return match?.[1];
}

export const productService = {
  getAll: async (params: ProductListParams = {}) => {
    const {
      page = 1,
      limit = 12,
      search = "",
      categorySlug,
      brand,
      isFeatured,
      includeUnpublished = false,
      sort = "newest",
    } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(includeUnpublished ? {} : { isPublished: true }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { brand: { contains: search, mode: "insensitive" } },
              { shortDescription: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(brand ? { brand: { equals: brand, mode: "insensitive" } } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {}),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === "rating"
        ? { rating: "desc" }
        : sort === "priceAsc"
          ? { price: "asc" }
          : sort === "priceDesc"
            ? { price: "desc" }
            : sort === "name"
              ? { name: "asc" }
              : { createdAt: "desc" };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: publicListInclude,
        orderBy,
        take: limit,
        skip,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, totalPages: Math.ceil(total / limit) };
  },

  getAllForSelect: async () => {
    return prisma.product.findMany({
      select: { id: true, name: true, slug: true, thumbnailUrl: true },
      orderBy: { name: "asc" },
    });
  },

  getFeatured: async (limit = 8) => {
    return prisma.product.findMany({
      where: { isPublished: true, isFeatured: true },
      include: publicListInclude,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  },

  getTrending: async (limit = 8) => {
    return prisma.product.findMany({
      where: { isPublished: true },
      include: publicListInclude,
      orderBy: [{ rating: "desc" }, { ratingCount: "desc" }],
      take: limit,
    });
  },

  // Homepage "Video Reviews" strip - most recent featured videos across all published products.
  getFeaturedVideos: async (limit = 6) => {
    return prisma.videoReview.findMany({
      where: { product: { isPublished: true } },
      include: {
        product: { select: { name: true, slug: true, thumbnailUrl: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
  },

  getById: async (id: string) => {
    return prisma.product.findUnique({
      where: { id },
      include: fullDetailInclude,
    });
  },

  getBySlug: async (
    slug: string,
    opts: {
      includeUnpublished?: boolean;
      includeCustomerReviews?: boolean;
    } = {},
  ) => {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: opts.includeCustomerReviews
        ? {
            ...fullDetailInclude,
            customerReviews: {
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
              orderBy: { createdAt: "desc" as const },
            },
          }
        : fullDetailInclude,
    });
    if (!product) return null;
    if (!product.isPublished && !opts.includeUnpublished) return null;
    return product;
  },

  create: async (data: {
    slug: string;
    name: string;
    brand?: string;
    categoryId?: string;
    shortDescription: string;
    longDescription: string;
    verdict?: string;
    thumbnailUrl?: string;
    imageUrls?: string[];
    pros?: string[];
    cons?: string[];
    specifications?: {
      groupName?: string;
      label: string;
      value: string;
      displayOrder?: number;
    }[];
    affiliateLinks?: {
      storeName: string;
      affiliateUrl: string;
      price?: number | null;
      currency?: string;
      displayOrder?: number;
    }[];
    videoReviews?: {
      title: string;
      youtubeUrl: string;
      displayOrder?: number;
    }[];
    expertReviews?: {
      reviewerName: string;
      quote: string;
      rating?: number | null;
      displayOrder?: number;
    }[];
    price?: number | null;
    originalPrice?: number | null;
    currency?: string;
    releaseDate?: string | null;
    isFeatured?: boolean;
    isPublished?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    relatedProductIds?: string[];
  }) => {
    const {
      specifications,
      relatedProductIds,
      affiliateLinks,
      videoReviews,
      expertReviews,
      categoryId,
      releaseDate,
      isPublished,
      ...rest
    } = data;

    return prisma.product.create({
      data: {
        ...rest,
        longDescription: sanitizeHtml(rest.longDescription),
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        releaseDate: releaseDate ? new Date(releaseDate) : undefined,
        isPublished: !!isPublished,
        publishedAt: isPublished ? new Date() : null,

        // Safe relation creation
        ...(specifications?.length && {
          specifications: {
            create: specifications.map((s, i) => ({
              ...s,
              displayOrder: s.displayOrder ?? i,
            })),
          },
        }),
        ...(affiliateLinks?.length && {
          affiliateLinks: {
            create: affiliateLinks.map((a, i) => ({
              ...a,
              displayOrder: a.displayOrder ?? i,
            })),
          },
        }),
        ...(videoReviews?.length && {
          videoReviews: {
            create: videoReviews.map((v, i) => ({
              ...v,
              youtubeId: extractYoutubeId(v.youtubeUrl),
              displayOrder: v.displayOrder ?? i,
            })),
          },
        }),
        ...(expertReviews?.length && {
          expertReviews: {
            create: expertReviews.map((e, i) => ({
              ...e,
              displayOrder: e.displayOrder ?? i,
            })),
          },
        }),
        ...(relatedProductIds?.length && {
          relatedTo: {
            connect: relatedProductIds.map((id) => ({ id })),
          },
        }),
      },
      include: fullDetailInclude,
    });
  },

  update: async (
    id: string,
    data: Partial<{
      slug: string;
      name: string;
      brand: string | null;
      categoryId: string | null;
      shortDescription: string;
      longDescription: string;
      verdict: string | null;
      thumbnailUrl: string | null;
      imageUrls: string[];
      pros: string[];
      cons: string[];
      specifications: {
        groupName?: string;
        label: string;
        value: string;
        displayOrder?: number;
      }[];
      affiliateLinks?: {
        storeName: string;
        affiliateUrl: string;
        price?: number | null;
        currency?: string;
        displayOrder?: number;
      }[];
      videoReviews?: {
        title: string;
        youtubeUrl: string;
        displayOrder?: number;
      }[];
      expertReviews?: {
        reviewerName: string;
        quote: string;
        rating?: number | null;
        displayOrder?: number;
      }[];
      price: number | null;
      originalPrice: number | null;
      currency: string;
      releaseDate: string | null;
      isFeatured: boolean;
      isPublished: boolean;
      seoTitle: string | null;
      seoDescription: string | null;
      seoKeywords: string[];
      relatedProductIds: string[];
    }>,
  ) => {
    const {
      specifications,
      affiliateLinks,
      videoReviews,
      expertReviews,
      relatedProductIds,
      categoryId,
      releaseDate,
      isPublished,
      ...rest
    } = data;

    const current =
      isPublished !== undefined
        ? await prisma.product.findUnique({
            where: { id },
            select: { isPublished: true },
          })
        : null;

    return prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(rest.longDescription !== undefined
          ? { longDescription: sanitizeHtml(rest.longDescription) }
          : {}),
        ...(categoryId !== undefined
          ? {
              category: categoryId
                ? { connect: { id: categoryId } }
                : { disconnect: true },
            }
          : {}),
        ...(releaseDate !== undefined
          ? { releaseDate: releaseDate ? new Date(releaseDate) : null }
          : {}),
        ...(isPublished !== undefined
          ? {
              isPublished,
              publishedAt:
                isPublished && !current?.isPublished ? new Date() : undefined,
            }
          : {}),
        ...(specifications !== undefined
          ? {
              specifications: {
                deleteMany: {},
                create: specifications.map((s, i) => ({
                  ...s,
                  displayOrder: s.displayOrder ?? i,
                })),
              },
            }
          : {}),
        ...(affiliateLinks !== undefined
          ? {
              affiliateLinks: {
                deleteMany: {},
                create: affiliateLinks.map((a, i) => ({
                  ...a,
                  displayOrder: a.displayOrder ?? i,
                })),
              },
            }
          : {}),
        ...(videoReviews !== undefined
          ? {
              videoReviews: {
                deleteMany: {},
                create: videoReviews.map((v, i) => ({
                  ...v,
                  youtubeId: extractYoutubeId(v.youtubeUrl),
                  displayOrder: v.displayOrder ?? i,
                })),
              },
            }
          : {}),
        ...(expertReviews !== undefined
          ? {
              expertReviews: {
                deleteMany: {},
                create: expertReviews.map((e, i) => ({
                  ...e,
                  displayOrder: e.displayOrder ?? i,
                })),
              },
            }
          : {}),
        ...(relatedProductIds !== undefined
          ? {
              relatedTo: { set: relatedProductIds.map((rid) => ({ id: rid })) },
            }
          : {}),
      },
      include: fullDetailInclude,
    });
  },

  togglePublish: async (id: string) => {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { isPublished: true },
    });
    if (!product) return null;
    return prisma.product.update({
      where: { id },
      data: {
        isPublished: !product.isPublished,
        publishedAt: !product.isPublished ? new Date() : undefined,
      },
    });
  },

  toggleFeatured: async (id: string) => {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { isFeatured: true },
    });
    if (!product) return null;
    return prisma.product.update({
      where: { id },
      data: { isFeatured: !product.isFeatured },
    });
  },

  delete: async (id: string) => {
    return prisma.product.delete({ where: { id } });
  },

  // ---------- Affiliate links ----------
  addAffiliateLink: async (
    productId: string,
    data: {
      storeName: string;
      storeLogo?: string;
      productUrl?: string;
      affiliateUrl: string;
      price?: number | null;
      currency?: string;
      availability?:
        | "IN_STOCK"
        | "OUT_OF_STOCK"
        | "LIMITED_STOCK"
        | "PREORDER"
        | "DISCONTINUED";
      isActive?: boolean;
      displayOrder?: number;
      trackingId?: string;
    },
  ) => {
    return prisma.affiliateLink.create({ data: { ...data, productId } });
  },

  updateAffiliateLink: async (
    id: string,
    data: Prisma.AffiliateLinkUpdateInput,
  ) => {
    return prisma.affiliateLink.update({ where: { id }, data });
  },

  deleteAffiliateLink: async (id: string) => {
    return prisma.affiliateLink.delete({ where: { id } });
  },

  // ---------- Video reviews ----------
  addVideoReview: async (
    productId: string,
    data: {
      title: string;
      youtubeUrl: string;
      reviewerName?: string;
      reviewerChannelUrl?: string;
      isFeatured?: boolean;
      displayOrder?: number;
    },
  ) => {
    return prisma.videoReview.create({
      data: {
        ...data,
        productId,
        youtubeId: extractYoutubeId(data.youtubeUrl),
      },
    });
  },

  updateVideoReview: async (
    id: string,
    data: Prisma.VideoReviewUpdateInput,
  ) => {
    if (typeof data.youtubeUrl === "string") {
      data.youtubeId = extractYoutubeId(data.youtubeUrl);
    }
    return prisma.videoReview.update({ where: { id }, data });
  },

  deleteVideoReview: async (id: string) => {
    return prisma.videoReview.delete({ where: { id } });
  },

  // ---------- Expert reviews ----------
  addExpertReview: async (
    productId: string,
    data: {
      reviewerName: string;
      reviewerRole?: string;
      reviewerAvatar?: string;
      quote: string;
      sourceUrl?: string;
      rating?: number | null;
      isFeatured?: boolean;
      displayOrder?: number;
    },
  ) => {
    return prisma.expertReview.create({ data: { ...data, productId } });
  },

  updateExpertReview: async (
    id: string,
    data: Prisma.ExpertReviewUpdateInput,
  ) => {
    return prisma.expertReview.update({ where: { id }, data });
  },

  deleteExpertReview: async (id: string) => {
    return prisma.expertReview.delete({ where: { id } });
  },
};
