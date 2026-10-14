import mongoose, { Schema, Document } from "mongoose";

export interface ISiteSettingsDocument extends Document {
  key: string;
  teamSectionVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettingsDocument>(
  {
    key: { type: String, required: true, unique: true, index: true, default: "global_settings" },
    teamSectionVisible: { type: Boolean, default: true },
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

export const SiteSettingsModel = mongoose.model<ISiteSettingsDocument>(
  "SiteSettings",
  SiteSettingsSchema
);
export const SiteSettings = SiteSettingsModel;
