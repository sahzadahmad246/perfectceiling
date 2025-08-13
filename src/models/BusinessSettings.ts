import mongoose, { Schema, Document, Model } from "mongoose";

export type BusinessStatus =
  | "open"
  | "closed"
  | "temporary_closed"
  | "busy"
  | "holiday"
  | "by_appointment"
  | "maintenance";

export interface IBusinessSettings extends Document {
  name: string;
  primaryPhone: string;
  secondaryPhone?: string;
  status: BusinessStatus;
  terms: string[];
  logoUrl?: string;
  logoPublicId?: string;
  createdAt: Date;
  updatedAt: Date;
  updatedByUserId?: string;
}

const BusinessSettingsSchema = new Schema<IBusinessSettings>(
  {
    name: { type: String, required: true },
    primaryPhone: { type: String, required: true },
    secondaryPhone: { type: String },
    status: {
      type: String,
      enum: [
        "open",
        "closed",
        "temporary_closed",
        "busy",
        "holiday",
        "by_appointment",
        "maintenance",
      ],
      default: "open",
      index: true,
    },
    terms: { type: [String], default: [] },
    logoUrl: { type: String },
    logoPublicId: { type: String },
    updatedByUserId: { type: String },
  },
  { timestamps: true }
);

export const BusinessSettings: Model<IBusinessSettings> =
  mongoose.models.BusinessSettings ||
  mongoose.model<IBusinessSettings>("BusinessSettings", BusinessSettingsSchema);


