import mongoose, { Schema, Document } from "mongoose";

export interface IThreeDDoc extends Document {
  id: string;
  title: string;
  category?: string;
  client?: string;
  year?: string;
  duration?: string;
  resolution?: string;
  software?: string[];
  description?: string;
  deliverables?: string[];
  videoUrl?: string;
  posterUrl?: string;
  stats?: {
    fps?: string;
    renderEngine?: string;
    turnaround?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ThreeDSchema = new Schema<IThreeDDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String },
    client: { type: String },
    year: { type: String },
    duration: { type: String },
    resolution: { type: String },
    software: [{ type: String }],
    description: { type: String },
    deliverables: [{ type: String }],
    videoUrl: { type: String },
    posterUrl: { type: String },
    stats: {
      fps: { type: String },
      renderEngine: { type: String },
      turnaround: { type: String },
    },
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

export const ThreeDModel = mongoose.model<IThreeDDoc>("ThreeD", ThreeDSchema);
