import mongoose, { Schema, Document } from "mongoose";

export interface IFounderDoc extends Document {
  id: string;
  name: string;
  role: string;
  badge: string;
  subtitle: string;
  photoTag?: string;
  image: string;
  cityTag?: string;
  bio: string;
  bioSecondary: string;
  quote: string;
  specialties: string[];
  linkedinUrl: string;
  instagramUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const FounderSchema = new Schema<IFounderDoc>(
  {
    id: { type: String, required: true, unique: true, index: true, default: "founder-master-001" },
    name: { type: String, required: true, default: "SHUBHAM SINGH" },
    role: { type: String, required: true, default: "CREATIVE DIRECTOR & VISIONARY" },
    badge: { type: String, default: "MEET THE FOUNDER" },
    subtitle: { type: String, default: "LEADERSHIP & VISION" },
    photoTag: { type: String, default: "FOUNDER" },
    image: { type: String, default: "" },
    cityTag: { type: String, default: "VARANASI × GLOBAL" },
    bio: {
      type: String,
      default:
        "Born in India and raised in the city of artists, Varanasi, Shubham has been capturing stories and crafting visuals for as long as he can remember.",
    },
    bioSecondary: {
      type: String,
      default:
        "As an accomplished digital content creator and 3D visionary, he has collaborated with premier global mobile enterprises. His portfolio encompasses high-end commercial CGI, street photography stills, cinematic short films, and high-impact music videos.",
    },
    quote: {
      type: String,
      default:
        '"His unique style, artistic training, and profound appreciation for light and architecture make every frame an unforgettable visual journey."',
    },
    specialties: {
      type: [String],
      default: [
        "3D CGI & ArchViz",
        "Commercial Stills",
        "Cinematic Direction",
        "Creative Strategy",
      ],
    },
    linkedinUrl: { type: String, default: "https://linkedin.com" },
    instagramUrl: { type: String, default: "https://instagram.com" },
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

export const FounderModel = mongoose.model<IFounderDoc>("Founder", FounderSchema);
export const Founder = FounderModel;
