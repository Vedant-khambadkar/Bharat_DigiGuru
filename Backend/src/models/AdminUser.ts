import mongoose, { Schema, Document } from "mongoose";

export interface IAdminUserDoc extends Document {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "managedAdmin" | "superAdmin" | "admin" | "superadmin" | "managedadmin";
  createdBy?: string;
  resetPasswordOtp?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUserDoc>(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "Bharat DigiGuru Administrator" },
    role: { type: String, default: "managedAdmin" },
    createdBy: { type: String },
    resetPasswordOtp: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.resetPasswordOtp;
        delete ret.resetPasswordExpires;
        return ret;
      },
    },
  }
);

export const AdminUserModel = mongoose.model<IAdminUserDoc>("AdminUser", AdminUserSchema);
