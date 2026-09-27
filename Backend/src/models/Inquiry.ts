import mongoose, { Schema, Document } from "mongoose";

export interface IInquiryDoc extends Document {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  phone?: string;
  company?: string;
  services?: string[];
  budget?: string;
  timeline?: string;
  message: string;
  status: "NEW" | "CONTACTED" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiryDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    fullName: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    company: { type: String },
    services: [{ type: String }],
    budget: { type: String },
    timeline: { type: String },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "ARCHIVED"],
      default: "NEW",
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

export const InquiryModel = mongoose.model<IInquiryDoc>("Inquiry", InquirySchema);
