import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  price: z.coerce.number().positive("Price must be greater than 0"),
  mrp: z.coerce.number().optional().nullable(),
  description: z.string().min(10, "Description must be at least 10 characters").optional().nullable(),
  category_id: z.string().min(1, "Please select a category"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  rating: z.coerce.number().min(0).max(5).default(4.5),
  review_count: z.coerce.number().int().min(0).default(0),
  is_bestseller: z.boolean().default(false),
  badges: z.array(z.string()).default([]),
});

export type ProductFormData = z.infer<typeof productSchema>;
