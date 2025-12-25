export interface ImageRef {
  url: string;
  publicId: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: ImageRef[];
  createdAt: string;
  updatedAt: string;
}

export type ServiceStatus = "active" | "inactive";

export interface ServiceDTO {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  content?: string; // HTML
  priceRange?: string;
  tags: string[];
  status: ServiceStatus;
  images: ImageRef[];
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialDTO {
  id: string;
  authorName: string;
  message: string;
  categoryId: string;
  status: "published" | "hidden";
  createdAt: string;
  updatedAt: string;
}


