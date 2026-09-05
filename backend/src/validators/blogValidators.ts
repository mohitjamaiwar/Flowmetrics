import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createBlogPostSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(150)
    .regex(slugRegex, "Slug must be lowercase, alphanumeric, and hyphen-separated (e.g. my-post-title)"),
  excerpt: z.string().trim().min(10, "Excerpt must be at least 10 characters").max(300),
  content: z.string().trim().min(20, "Content must be at least 20 characters"),
  coverImage: z.string().url("Cover image must be a valid URL"),
  author: z.string().trim().min(2).max(80),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
