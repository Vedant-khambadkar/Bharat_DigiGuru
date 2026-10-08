import mongoose, { Schema, Document } from "mongoose";
import { IBlogItem } from "../types/index.js";

export interface IBlogDocument extends Omit<IBlogItem, "id">, Document {
  _id: mongoose.Types.ObjectId;
  id: string;
}

const BlogSchema = new Schema<IBlogDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    number: { type: String, default: "(01)" },
    category: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    readTime: { type: String, default: "5 MIN READ" },
    date: { type: String, default: "AUG 2026" },
    image: { type: String, default: "" },
    content: [{ type: String }],
    bullets: [{ type: String }],
    isPublished: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret.id || ret._id?.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Blog = mongoose.model<IBlogDocument>("Blog", BlogSchema);
export const BlogModel = Blog;
