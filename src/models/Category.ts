import { Schema, model, models, type Model, type Document } from "mongoose"

export interface IImageRef {
  url: string
  publicId: string
}

export interface ICategory extends Document {
  name: string
  slug: string
  description?: string
  images: IImageRef[]
  createdAt: Date
  updatedAt: Date
}

const ImageRefSchema = new Schema<IImageRef>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
})

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    images: { type: [ImageRefSchema], default: [] },
  },
  { timestamps: true }
)

export const Category: Model<ICategory> =
  models.Category || model<ICategory>("Category", CategorySchema)


