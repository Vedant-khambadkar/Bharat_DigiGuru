import mongoose, { Schema, Document } from "mongoose";
import { IStoryItem, IStorySlide } from "../types/index.js";

export interface IStoryDoc extends Document, Omit<IStoryItem, "id"> {
  id: string;
}

const StorySlideSchema = new Schema<IStorySlide>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], default: "image" },
    url: { type: String, required: true },
    thumbnail: { type: String },
    duration: { type: Number, default: 5 },
    caption: { type: String },
    linkText: { type: String },
    linkUrl: { type: String },
  },
  { _id: false }
);

const StorySchema = new Schema<IStoryDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    category: { type: String, default: "Highlights" },
    coverImage: { type: String },
    author: {
      name: { type: String, default: "Bharat DigiGuru" },
      avatar: { type: String },
    },
    slides: [StorySlideSchema],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
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

export const StoryModel = mongoose.model<IStoryDoc>("Story", StorySchema);
