import mongoose, { Schema, Document } from "mongoose";

export interface IPortfolioDoc extends Document {
  id: string | number;
  number?: string;
  category?: string;
  client?: string;
  year?: string;
  title: string;
  subtitle?: string;
  tags?: string[];
  description?: string;
  metrics?: string[];
  image?: string;
  video?: string;
  videoDuration?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioSchema = new Schema<IPortfolioDoc>(
  {
    id: { type: Schema.Types.Mixed, required: true, unique: true, index: true },
    number: { type: String },
    category: { type: String },
    client: { type: String },
    year: { type: String },
    title: { type: String, required: true },
    subtitle: { type: String },
    tags: [{ type: String }],
    description: { type: String },
    metrics: [{ type: String }],
    image: { type: String },
    video: { type: String },
    videoDuration: { type: String },
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

export const PortfolioModel = mongoose.model<IPortfolioDoc>("Portfolio", PortfolioSchema);
