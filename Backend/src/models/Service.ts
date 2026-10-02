import mongoose, { Schema, Document } from "mongoose";
import { IServiceWorkItem } from "../types/index.js";

export interface IServiceDoc extends Document {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  tag?: string;
  image?: string;
  works?: IServiceWorkItem[];
  details?: {
    deliverables: string[];
    timeline: string;
    description: string;
    chips?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const ServiceWorkItemSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["video", "image", "youtube"], required: true },
    url: { type: String, required: true },
    thumbnail: { type: String },
    tag: { type: String, default: "" },
    description: { type: String },
    metrics: { type: String },
    youtubeId: { type: String },
  },
  { _id: false }
);

const ServiceDetailsSchema = new Schema(
  {
    deliverables: [{ type: String }],
    timeline: { type: String, default: "Ongoing Retainer / Sprint Based" },
    description: { type: String, default: "" },
    chips: [{ type: String }],
  },
  { _id: false }
);

const ServiceSchema = new Schema<IServiceDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    number: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    tag: { type: String, default: "" },
    image: { type: String, default: "" },
    works: [ServiceWorkItemSchema],
    details: ServiceDetailsSchema,
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

export const ServiceModel = mongoose.model<IServiceDoc>("Service", ServiceSchema);
export const Service = ServiceModel;
