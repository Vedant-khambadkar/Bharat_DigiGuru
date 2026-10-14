import mongoose, { Schema, Document } from "mongoose";

export interface IBrandCollaborationDoc extends Document {
  id: string;
  name: string;
  logoUrl: string;
  altText: string;
  order: number;
  isActive: boolean;
  originalFormat?: string;
  format?: string;
  size?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BrandCollaborationSchema = new Schema<IBrandCollaborationDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true },
    altText: { type: String, default: "" },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    originalFormat: { type: String, default: "" },
    format: { type: String, default: "webp" },
    size: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const BrandCollaborationModel = mongoose.model<IBrandCollaborationDoc>(
  "BrandCollaboration",
  BrandCollaborationSchema
);
export const BrandCollaboration = BrandCollaborationModel;
