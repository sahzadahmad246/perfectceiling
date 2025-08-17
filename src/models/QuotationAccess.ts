// models/QuotationAccess.ts
import { Schema, model, models, Types } from "mongoose";

export interface IQuotationAccess {
  _id: Types.ObjectId;
  quotationId: string;
  ipAddress: string;
  userAgent: string;
  accessedAt: Date;
  verificationAttempts: number;
  successful: boolean;
}

const QuotationAccessSchema = new Schema<IQuotationAccess>(
  {
    quotationId: { type: String, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    accessedAt: { type: Date, default: Date.now },
    verificationAttempts: { type: Number, default: 0 },
    successful: { type: Boolean, required: true },
  },
  { timestamps: true }
);

// Add indexes for efficient queries
QuotationAccessSchema.index({ quotationId: 1, accessedAt: -1 });
QuotationAccessSchema.index({ ipAddress: 1, accessedAt: -1 });

export const QuotationAccess =
  models.QuotationAccess || model<IQuotationAccess>("QuotationAccess", QuotationAccessSchema);