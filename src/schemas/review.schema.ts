import * as z from 'zod';

export const reviewSchema = z.object({
  rating: z.number({ message: "Rating must be a number" }).min(1, { message: "Rating must be at least 1." }).max(5, { message: "Rating must not exceed 5." }),
  comment: z.string().min(10, { message: "Comment must be at least 10 characters." }),
  productId: z.string(),
  userId: z.string()
});

export type ReviewTypes = z.infer<typeof reviewSchema>;