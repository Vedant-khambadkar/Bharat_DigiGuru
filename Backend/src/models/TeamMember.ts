import mongoose, { Schema, Document } from "mongoose";

export interface ITeamMemberDoc extends Document {
  id: string;
  name: string;
  role: string;
  column: number; // 1, 2, 3, 4, or 5
  order: number;
  image: string;
  bio?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMemberDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    column: { type: Number, required: true, min: 1, max: 5, default: 1 },
    order: { type: Number, default: 0 },
    image: { type: String, required: true },
    bio: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
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

export const TeamMemberModel = mongoose.model<ITeamMemberDoc>("TeamMember", TeamMemberSchema);
export const TeamMember = TeamMemberModel;
