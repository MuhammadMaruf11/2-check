import * as z from "zod";

const specificationSchema = z.object({
  id: z.string().optional(),
  groupName: z.string().optional().or(z.literal("")),
  label: z.string().min(1, "Label is required."),
  value: z.string().min(1, "Value is required."),
  displayOrder: z.number().default(0),
});

const affiliateLinkSchema = z.object({
  id: z.string().optional(),
  storeName: z.string().min(1, "Store name is required."),
  storeLogo: z.string().optional().or(z.literal("")),
  productUrl: z.string().optional().or(z.literal("")),
  affiliateUrl: z.string().url("Must be a valid URL."),
  price: z.number().optional().nullable(),
  currency: z.string().default("USD"),
  availability: z
    .enum(["IN_STOCK", "OUT_OF_STOCK", "LIMITED_STOCK", "PREORDER", "DISCONTINUED"])
    .default("IN_STOCK"),
  isActive: z.boolean().default(true),
  displayOrder: z.number().default(0),
  trackingId: z.string().optional().or(z.literal("")),
});

const videoReviewSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required."),
  youtubeUrl: z.string().url("Must be a valid YouTube URL."),
  reviewerName: z.string().optional().or(z.literal("")),
  reviewerChannelUrl: z.string().optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().default(0),
});

const expertReviewSchema = z.object({
  id: z.string().optional(),
  reviewerName: z.string().min(1, "Reviewer name is required."),
  reviewerRole: z.string().optional().or(z.literal("")),
  reviewerAvatar: z.string().optional().or(z.literal("")),
  quote: z.string().min(1, "Quote is required."),
  sourceUrl: z.string().optional().or(z.literal("")),
  rating: z.number().min(0).max(5).optional().nullable(),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().default(0),
});

export const productSchema = z.object({
  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters." })
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and hyphen-separated."),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(200),
  brand: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),

  shortDescription: z
    .string()
    .min(10, { message: "Short description must be at least 10 characters." })
    .max(300),
  longDescription: z
    .string()
    .min(20, { message: "Full description must be at least 20 characters." }),
  verdict: z.string().optional().or(z.literal("")),

  thumbnailUrl: z.string().optional().or(z.literal("")),
  imageUrls: z.array(z.string()).default([]),

  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),

  specifications: z.array(specificationSchema).default([]),

  price: z.number().positive().optional().nullable(),
  originalPrice: z.number().positive().optional().nullable(),
  currency: z.string().default("USD"),

  releaseDate: z.string().optional().nullable(),

  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),

  seoTitle: z.string().optional().or(z.literal("")),
  seoDescription: z.string().optional().or(z.literal("")),
  seoKeywords: z.array(z.string()).default([]),

  affiliateLinks: z.array(affiliateLinkSchema).default([]),
  videoReviews: z.array(videoReviewSchema).default([]),
  expertReviews: z.array(expertReviewSchema).default([]),

  relatedProductIds: z.array(z.string()).default([]),
});

export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormValues = z.output<typeof productSchema>;
export type AffiliateLinkInput = z.infer<typeof affiliateLinkSchema>;
export type VideoReviewInput = z.infer<typeof videoReviewSchema>;
export type ExpertReviewInput = z.infer<typeof expertReviewSchema>;
export type SpecificationInput = z.infer<typeof specificationSchema>;
