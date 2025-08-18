import { z } from "zod"

export const ImageRefSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
})

export const CategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().default(""),
  images: z.array(ImageRefSchema).default([]),
})

export const SubcategorySchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().default(""),
  image: ImageRefSchema.optional(),
})

export const ServiceSchema = z.object({
  categoryId: z.string().min(1),
  subcategoryId: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().optional().default(""),
  description: z.string().optional().default(""),
  content: z.string().optional().default(""),
  priceRange: z.string().optional().default(""),
  tags: z.array(z.string()).default([]),
  status: z.enum(["active", "inactive"]).default("active"),
})

export type CategorySchemaType = z.infer<typeof CategorySchema>
export type SubcategorySchemaType = z.infer<typeof SubcategorySchema>
export type ServiceSchemaType = z.infer<typeof ServiceSchema>


