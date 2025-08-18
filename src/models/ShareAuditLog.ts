// models/ShareAuditLog.ts
import { Schema, model, models, Types } from "mongoose";

export interface IShareAuditLog {
  _id: Types.ObjectId;
  quotationId: string;
  action: "shared" | "accessed" | "revoked" | "verification_failed";
  userId?: string; // For admin actions
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const ShareAuditLogSchema = new Schema<IShareAuditLog>(
  {
    quotationId: { type: String, required: true },
    action: {
      type: String,
      enum: ["shared", "accessed", "revoked", "verification_failed"],
      required: true,
    },
    userId: { type: String, required: false },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, required: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Add indexes for efficient queries
ShareAuditLogSchema.index({ quotationId: 1, timestamp: -1 });
ShareAuditLogSchema.index({ action: 1, timestamp: -1 });
ShareAuditLogSchema.index({ userId: 1, timestamp: -1 }, { sparse: true });

export const ShareAuditLog =
  models.ShareAuditLog || model<IShareAuditLog>("ShareAuditLog", ShareAuditLogSchema);