import mongoose from "mongoose";
import dotenv from "dotenv";
import { TeamMember } from "../models/TeamMember.js";

dotenv.config();

export const TEAM_SEED_DATA = [
  // Column 1 (Left - Lower offset)
  {
    id: "team-elena-rostova",
    name: "ELENA ROSTOVA",
    role: "BRAND STRATEGIST",
    column: 1,
    order: 1,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=85",
    bio: "Translating complex market intelligence into distinct brand identities and omni-channel narratives.",
    isActive: true,
  },
  // Column 2 (Left-Center - Elevated top portrait + bottom portrait)
  {
    id: "team-dmitry-sullivan",
    name: "DMITRY SULLIWAN",
    role: "FOUNDER & CD",
    column: 2,
    order: 1,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=85",
    bio: "Leading creative direction, cognitive branding, and digital growth systems.",
    isActive: true,
  },
  {
    id: "team-alexei-voronov",
    name: "ALEXEI VORONOV",
    role: "3D ARCHITECT",
    column: 2,
    order: 2,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=85",
    bio: "Architecting interactive WebGL spatial experiences and photorealistic 3D products.",
    isActive: true,
  },
  // Column 3 (Center - Elegant focal portrait)
  {
    id: "team-victoria-chen",
    name: "VICTORIA CHEN",
    role: "CREATIVE DIRECTOR",
    column: 3,
    order: 1,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=85",
    bio: "Guiding high-fashion aesthetics, editorial campaigns, and cinematic visual design.",
    isActive: true,
  },
  // Column 4 (Right-Center - Elevated top portrait + bottom portrait)
  {
    id: "team-dmitry-korotevsky",
    name: "DMITRY KOROTEVSKY",
    role: "TECHNICAL DIRECTOR",
    column: 4,
    order: 1,
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=85",
    bio: "Building hyper-scalable cloud pipelines, custom full-stack solutions, and automated infrastructure.",
    isActive: true,
  },
  {
    id: "team-marcus-vance",
    name: "MARCUS VANCE",
    role: "PERFORMANCE LEAD",
    column: 4,
    order: 2,
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=85",
    bio: "Managing multi-channel performance ad funnels with strict conversion targets and +280% ROAS.",
    isActive: true,
  },
  // Column 5 (Right - Lower offset)
  {
    id: "team-sophie-noir",
    name: "SOPHIE NOIR",
    role: "ART DIRECTOR",
    column: 5,
    order: 1,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=85",
    bio: "Crafting bespoke digital interfaces, editorial layout systems, and typography.",
    isActive: true,
  },
];

async function seedTeam() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/bharat-digiguru";
  console.log("Connecting to MongoDB for Team seeding...");
  await mongoose.connect(uri);

  console.log(`Clearing existing team records and inserting ${TEAM_SEED_DATA.length} members...`);
  await TeamMember.deleteMany({});

  for (const member of TEAM_SEED_DATA) {
    await TeamMember.create(member);
    console.log(`✓ Seeded team member: [Col ${member.column}] ${member.name} (${member.role})`);
  }

  console.log("\n✨ Team Members seeding completed successfully!");
  await mongoose.disconnect();
  process.exit(0);
}

if (process.argv[1]?.includes("seedTeam")) {
  seedTeam().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
}
