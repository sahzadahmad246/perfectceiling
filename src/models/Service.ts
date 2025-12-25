import { Schema, model, models, type Model, type Document } from "mongoose"

export type ServiceStatus = "active" | "inactive"

export interface IService extends Document {
  categoryId: string
  title: string
  slug: string
  summary?: string
  description?: string
  content?: string
  priceRange?: string
  tags: string[]
  status: ServiceStatus
  images?: Array<{ url: string; publicId: string }>
  createdAt: Date
  updatedAt: Date
}

const ServiceSchema = new Schema<IService>(
  {
    categoryId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    summary: { type: String },
    description: { type: String },
    content: { type: String },
    priceRange: { type: String },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    images: { type: [{ url: String, publicId: String }], default: [] },
  },
  { timestamps: true }
)

export const Service: Model<IService> =
  models.Service || model<IService>("Service", ServiceSchema)


