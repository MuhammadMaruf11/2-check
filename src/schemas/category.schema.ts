import * as z from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters.")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and hyphen-separated."),
  description: z.string().optional().or(z.literal("")),
  icon: z.string().optional().or(z.literal("")),
  displayOrder: z.number().default(0),
});

export type CategoryFormInput = z.input<typeof categorySchema>;
export type CategoryFormValues = z.output<typeof categorySchema>;
