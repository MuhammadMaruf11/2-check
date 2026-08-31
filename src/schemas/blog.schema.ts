import * as z from "zod";

export const blogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  subTitle: z.string().optional(),
  slug: z.string().min(3, "Slug must be at least 3 characters."),
  content: z.any(),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
  coverImageFile: z.any().optional(),
  productIds: z.array(z.string()).optional(),
  status: z
    .enum(["DRAFT", "PENDING_REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "REJECTED"])
    .default("PENDING_REVIEW"),
  scheduledAt: z.string().optional().nullable(),
  authorId: z.string().optional(),
});

export type BlogFormInput = z.input<typeof blogSchema>;
export type BlogFormValues = z.output<typeof blogSchema>;
