import { Schema, model, models, type Model, type Document } from "mongoose"

export interface ITestimonial extends Document {
  authorName: string
  message: string
  categoryId: string
  status: "published" | "hidden"
  createdAt: Date
  updatedAt: Date
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    authorName: { type: String, required: true },
    message: { type: String, required: true },
    categoryId: { type: String, required: true, index: true },
    status: { type: String, enum: ["published", "hidden"], default: "published" },
  },
  { timestamps: true }
)

export const Testimonial: Model<ITestimonial> =
  models.Testimonial || model<ITestimonial>("Testimonial", TestimonialSchema)



