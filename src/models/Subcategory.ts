import { Schema, model, models, type Model, type Document } from "mongoose"

export interface IImageRef {
  url: string
  publicId: string
}

export interface ISubcategory extends Document {
  categoryId: string
  name: string
  slug: string
  description?: string
  image?: IImageRef
  createdAt: Date
  updatedAt: Date
}

const ImageRefSchema = new Schema<IImageRef>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
})

const SubcategorySchema = new Schema<ISubcategory>(
  {
    categoryId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    image: { type: ImageRefSchema, required: false },
  },
  { timestamps: true }
)

export const Subcategory: Model<ISubcategory> =
  models.Subcategory || model<ISubcategory>("Subcategory", SubcategorySchema)


