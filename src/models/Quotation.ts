// models/Quotation.ts
import { Schema, model, models, Types } from "mongoose";

export interface IQuotation {
  _id: Types.ObjectId; // Explicitly define _id as Types.ObjectId
  clientInfo: {
    name: string;
    phone: string;
    address: string;
  };
  workDetails: {
    items: Array<{
      description: string;
      area?: number;
      unit?: "sqft" | "runningft";
      rate?: number;
      total: number;
    }>;
    total: number;
    discount: number;
    grandTotal: number;
    notes?: string;
  };
  status: "accepted" | "pending" | "rejected";
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationSchema = new Schema<IQuotation>(
  {
    clientInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    workDetails: {
      items: [
        {
          description: { type: String, required: true },
          area: { type: Number, required: false },
          unit: { type: String, enum: ["sqft", "runningft"], required: false },
          rate: { type: Number, required: false },
          total: { type: Number, required: true },
        },
      ],
      total: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
      notes: { type: String, required: false },
    },
    status: {
      type: String,
      enum: ["accepted", "pending", "rejected"],
      default: "pending",
    },
    createdByUserId: { type: String, required: true },
  },
  { timestamps: true }
);

export const Quotation =
  models.Quotation || model<IQuotation>("Quotation", QuotationSchema);