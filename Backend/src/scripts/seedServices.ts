import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { Service } from "../models/Service.js";
import { getS3Client, isS3Configured, getCloudFrontUrl } from "../services/s3Service.js";
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

dotenv.config();

const CLOUDFRONT_BASE = (
  process.env.CLOUDFRONT_URL || "https://d1mou18mn47yy7.cloudfront.net"
).replace(/\/+$/, "");

export const SERVICES_SEED_DATA = [
  {
    id: "digital-media-services",
    number: "(01)",
    title: "Digital Media Services",
    subtitle: "360° SMM, SEO, PERFORMANCE ADS & LEAD GENERATION",
    tag: "& 360° DIGITAL ACCELERATION",
    image: `${CLOUDFRONT_BASE}/assets/DigitalMedia/DigitalMedia-1.webp`,
    works: [
      {
        id: "dm-work-1",
        title: "Apex Growth Campaign & SMM",
        type: "image" as const,
        url: `${CLOUDFRONT_BASE}/assets/DigitalMedia/DigitalMedia-2.webp`,
        thumbnail: `${CLOUDFRONT_BASE}/assets/DigitalMedia/DigitalMedia-2.webp`,
        tag: "Ad Campaign Reel",
        description: "Multi-channel lead generation and ad conversion campaign with +280% ROI.",
        metrics: "+280% Lead Volume • 4K",
      },
      {
        id: "dm-work-2",
        title: "Omnichannel Brand Positioning",
        type: "image" as const,
        url: `${CLOUDFRONT_BASE}/assets/DigitalMedia/DigitalMedia-4.webp`,
        thumbnail: `${CLOUDFRONT_BASE}/assets/DigitalMedia/DigitalMedia-4.webp`,
        tag: "Brand Architecture",
        description: "Complete visual branding, meta ads strategy, and high-converting creative copies.",
        metrics: "4.8M Impressions",
      },
      {
        id: "dm-work-3",
        title: "Viral Social Content & SEO",
        type: "image" as const,
        url: `${CLOUDFRONT_BASE}/assets/DigitalMedia/DigitalMedia-3.webp`,
        thumbnail: `${CLOUDFRONT_BASE}/assets/DigitalMedia/DigitalMedia-3.webp`,
        tag: "SEO & Growth Engine",
        description: "Data-driven SEO dominance and organic engagement across search & socials.",
        metrics: "Top 3 SERP Ranking",
      },
    ],
    details: {
      description:
        "Our team of professional digital media specialists is dedicated to providing tailored services be it SMM, SEO, SMO or ORM to help you achieve your goals. From crafting engaging social media strategies to optimizing your online presence, count on us to elevate your digital footprint and drive results that matter. Delve into the expansive range of services provided by Bharat DigiGuru, meticulously designed to enhance your online presence. Our offerings span a diverse spectrum, encompassing strategic digital marketing campaigns and innovative web design and development, each uniquely tailored to align with your specific objectives in the digital realm. Precision-crafted marketing endeavors elevate brand visibility and drive engagement across multiple platforms. From Social Media Marketing to targeted Lead Generation strategies, we offer comprehensive solutions to address your unique business needs. Partner with us to propel your brand toward digital success.",
      deliverables: [
        "Strategic Social Media Marketing (SMM)",
        "Search Engine Optimization (SEO & SMO)",
        "Online Reputation Management (ORM)",
        "Targeted Lead Generation & Automation",
      ],
      chips: [
        "SMM",
        "SEO",
        "SMO",
        "ORM",
        "Facebook Ads",
        "Google Ads",
        "YouTube Promotions",
        "WhatsApp Community",
        "Content Management",
        "Email Marketing",
        "Instagram Ads",
        "Lead Automation",
        "Website Development",
        "X Promotions",
        "Lead Generation",
        "Website Maintenance",
      ],
      timeline: "Ongoing Retainer / Sprint Based",
    },
  },
  {
    id: "photography-services",
    number: "(02)",
    title: "Photography Services",
    subtitle: "PRODUCT, CORPORATE & EVENTS",
    tag: "& HIGH-RES STUDIO SHOOTS",
    image: `${CLOUDFRONT_BASE}/assets/Picture/Picture4.webp`,
    works: [
      {
        id: "photo-work-1",
        title: "Luxury Product Studio Shoot",
        type: "image" as const,
        url: `${CLOUDFRONT_BASE}/assets/photography/photography-1.webp`,
        thumbnail: `${CLOUDFRONT_BASE}/assets/photography/photography-1.webp`,
        tag: "Studio Lighting",
        description: "High-end product photography featuring precision studio lighting and reflection controls.",
        metrics: "Ultra-HD Master",
      },
      {
        id: "photo-work-2",
        title: "Executive Corporate Portfolios",
        type: "image" as const,
        url: `${CLOUDFRONT_BASE}/assets/photography/photography-2.webp`,
        thumbnail: `${CLOUDFRONT_BASE}/assets/photography/photography-2.webp`,
        tag: "Executive Headshots",
        description: "Editorial corporate portraits and leadership team showcase for modern enterprise brands.",
        metrics: "100+ C-Suite Shoots",
      },
      {
        id: "photo-work-3",
        title: "Global Summit & Event Coverage",
        type: "image" as const,
        url: `${CLOUDFRONT_BASE}/assets/photography/photography-3.webp`,
        thumbnail: `${CLOUDFRONT_BASE}/assets/photography/photography-3.webp`,
        tag: "Live Event Photography",
        description: "Real-time live conference capture, keynote spotlights, and high-energy atmosphere moments.",
        metrics: "Instant Live Delivery",
      },
    ],
    details: {
      description:
        "Trust our team of skilled photographers to capture your vision with creativity, professionalism, and attention to detail. Whether you require product photography, corporate headshots, or event coverage, we are committed to delivering high-quality images that align seamlessly with your brand. At Bharat DigiGuru, we understand the power of captivating visuals in conveying your brand's story and capturing your audience's attention. Our Photography Services go beyond just taking pictures; we strive to encapsulate the essence of your brand and showcase it in the most compelling way possible. Whether it's product photography, corporate events, or lifestyle shoots, our team of skilled photographers has the expertise to bring your vision to life. With an eye for detail and a passion for creativity, we ensure that every photograph we capture tells a story and leaves a lasting impression on your audience.",
      deliverables: [
        "High-End Product Photography",
        "Corporate Executive Headshots",
        "Event Coverage & Lifestyle Shoots",
        "Studio Lighting & Color Grading",
      ],
      chips: [
        "Product Photography",
        "Corporate Headshots",
        "Event Coverage",
        "Lifestyle Shoots",
        "Studio Lighting",
        "Commercial Retouching",
        "Brand Portfolios",
      ],
      timeline: "1–2 Weeks Per Shoot",
    },
  },
  {
    id: "videography-services",
    number: "(03)",
    title: "Videography Services",
    subtitle: "PROMOTIONAL, SOCIAL & DOCUMENTARIES",
    tag: "& CINEMATIC STORYTELLING",
    image: `${CLOUDFRONT_BASE}/assets/Picture/Picture7.webp`,
    works: [
      {
        id: "video-work-1",
        title: "Abhishek & Nitya — Rajasthan Destination Wedding",
        type: "youtube" as const,
        url: "https://www.youtube.com/watch?v=-nWIdh4-PeA",
        youtubeId: "-nWIdh4-PeA",
        thumbnail: "https://img.youtube.com/vi/-nWIdh4-PeA/hqdefault.jpg",
        tag: "Destination Wedding",
        description: "Cinematic royal destination wedding film captured across the palaces and heritage locales of Rajasthan.",
        metrics: "4K Cinema • Drone Master",
      },
      {
        id: "video-work-2",
        title: "Kush & Venu — Varanasi Pre-Wedding Film",
        type: "youtube" as const,
        url: "https://www.youtube.com/watch?v=KgXOwkM9o30",
        youtubeId: "KgXOwkM9o30",
        thumbnail: "https://img.youtube.com/vi/KgXOwkM9o30/hqdefault.jpg",
        tag: "Pre-Wedding Cinema",
        description: "Soulful pre-wedding film set against the ethereal morning ghats and sacred architecture of Varanasi.",
        metrics: "Ghats of Kashi • 4K Master",
      },
      {
        id: "video-work-3",
        title: "Bhavesh & Kusum — Leh Ladakh Visual Odyssey",
        type: "youtube" as const,
        url: "https://www.youtube.com/watch?v=PybqBUGmTkE",
        youtubeId: "PybqBUGmTkE",
        thumbnail: "https://img.youtube.com/vi/PybqBUGmTkE/hqdefault.jpg",
        tag: "Mountain Odyssey",
        description: "Epic cinematic visual narrative through the dramatic mountain passes and blue waters of Leh Ladakh.",
        metrics: "High Altitude • 4K 60FPS",
      },
      {
        id: "video-work-4",
        title: "Kumar Kanti & Dr. Ankita — Jaisalmer & Jaipur Reel",
        type: "youtube" as const,
        url: "https://www.youtube.com/watch?v=cl6LdLUealA",
        youtubeId: "cl6LdLUealA",
        thumbnail: "https://img.youtube.com/vi/cl6LdLUealA/hqdefault.jpg",
        tag: "Royal Heritage",
        description: "Grand romantic film shot in the royal dunes of Jaisalmer and iconic forts of Jaipur.",
        metrics: "Golden Dunes • Ultra-HD",
      },
    ],
    details: {
      description:
        "From captivating promotional videos to engaging social media content, our team excels in delivering high-quality videography services that elevate your brand. Trust our team to craft visually compelling narratives and weave stories that resonate with your audience and drive meaningful engagement. Video has become an integral part of digital marketing, offering unparalleled opportunities to engage and connect with your audience. At Bharat DigiGuru, our Videography Services are designed to help you harness the power of visual storytelling to elevate your brand and drive meaningful engagement. From promotional videos and corporate documentaries to social media content and event coverage, our team of talented videographers is equipped with the skills and expertise to bring your ideas to life on screen. With a keen understanding of storytelling techniques and the latest video production trends, we create immersive and impactful videos that resonate with your audience and leave a lasting impression.",
      deliverables: [
        "Promotional Videos & Ad Films",
        "Corporate Documentaries & Spotlights",
        "Social Media Reels, TikToks & Shorts",
        "4K Production, Drone Footage & Color Grading",
      ],
      chips: [
        "Brand Films",
        "Promotional Videos",
        "Reels & Shorts",
        "Corporate Documentaries",
        "Event Cinematography",
        "Motion Design",
        "Post-Production & Sound",
      ],
      timeline: "2–3 Weeks Per Production",
    },
  },
  {
    id: "content-generation",
    number: "(04)",
    title: "Content Generation",
    subtitle: "EDITORIAL, CONTENT, STRATEGIC , DEVELOPMENT & NARRATIVES",
    tag: "& STRATEGIC COPYWRITING",
    image: `${CLOUDFRONT_BASE}/assets/Picture/Picture10.webp`,
    works: [
      {
        id: "content-work-1",
        title: "SEO Authority Publication",
        type: "image" as const,
        url: `${CLOUDFRONT_BASE}/assets/Picture/Picture10.webp`,
        thumbnail: `${CLOUDFRONT_BASE}/assets/Picture/Picture10.webp`,
        tag: "Thought Leadership",
        description: "In-depth industry whitepapers and technical blog articles driving inbound organic traffic.",
        metrics: "95+ Readability Score",
      },
      {
        id: "content-work-2",
        title: "High-Converting Sales Funnels",
        type: "image" as const,
        url: `${CLOUDFRONT_BASE}/assets/Picture/Picture11.webp`,
        thumbnail: `${CLOUDFRONT_BASE}/assets/Picture/Picture11.webp`,
        tag: "Direct Response Copy",
        description: "Landing page conversion copywriting tailored for high-ticket SaaS and enterprise buyers.",
        metrics: "+64% Conversion Lift",
      },
      {
        id: "content-work-3",
        title: "Omnichannel Brand Narratives",
        type: "image" as const,
        url: `${CLOUDFRONT_BASE}/assets/Picture/Picture12.webp`,
        thumbnail: `${CLOUDFRONT_BASE}/assets/Picture/Picture12.webp`,
        tag: "Email & Social Scripts",
        description: "Automated nurturing drip campaigns and viral tweet/LinkedIn story threads.",
        metrics: "42% Open Rate",
      },
    ],
    details: {
      description:
        "With a team of seasoned experts at the helm, we specialize in producing captivating content, from thought-provoking blog posts to enlightening articles designed to capture the attention of your audience. Rely on us to weave compelling narratives that forge genuine connections and bolster your online visibility. Content is king in the digital age, and at Bharat DigiGuru, we specialize in creating high-quality, engaging content that resonates with your target audience. Whether it's blog posts, articles, social media posts, or website copy, our Content Generation services are tailored to meet your unique needs and objectives. Our team of experienced writers and content creators combines creativity with strategic thinking to deliver content that not only captivates your audience but also drives results. From crafting compelling narratives to optimizing content for search engines, we ensure that every piece of content we produce is optimized to help you achieve your goals and stand out in the crowded digital landscape.",
      deliverables: [
        "SEO-Driven Thought Leadership & Articles",
        "High-Converting Landing Page Copy",
        "Social Media Copywriting & Scripts",
        "Email Newsletters & Nurturing Sequences",
      ],
      chips: [
        "SEO Articles",
        "Thought Leadership",
        "Website Copy",
        "Social Media Copy",
        "Email Newsletters",
        "Brand Storytelling",
        "Content Strategy",
      ],
      timeline: "Fast Turnaround / Monthly Retainer",
    },
  },
  {
    id: "ai-art-generation",
    number: "(05)",
    title: "Art Generation",
    subtitle: "DIGITAL MASTERPIECES & VISUAL ASSETS",
    tag: "& NEXT-GEN CREATIVE TECH",
    image: `${CLOUDFRONT_BASE}/assets/Picture/Picture13.webp`,
    works: [
      {
        id: "ai-art-work-1",
        title: "Generative Cybernetic Key Visuals",
        type: "image" as const,
        url: `${CLOUDFRONT_BASE}/assets/Picture/Picture13.webp`,
        thumbnail: `${CLOUDFRONT_BASE}/assets/Picture/Picture13.webp`,
        tag: "Generative Concept",
        description: "Futuristic visual storytelling combining neural diffusion models and 3D motion design.",
        metrics: "8K Native Render",
      },
      {
        id: "ai-art-work-2",
        title: "Surreal 3D Spatial Characters",
        type: "image" as const,
        url: `${CLOUDFRONT_BASE}/assets/Picture/Picture1.webp`,
        thumbnail: `${CLOUDFRONT_BASE}/assets/Picture/Picture1.webp`,
        tag: "Character Design",
        description: "Custom digital character assets rendered with custom prompt loRA weights and shaders.",
        metrics: "Commercial Ready",
      },
      {
        id: "ai-art-work-3",
        title: "Abstract Luxury Key Visuals",
        type: "image" as const,
        url: `${CLOUDFRONT_BASE}/assets/Picture/Picture2.webp`,
        thumbnail: `${CLOUDFRONT_BASE}/assets/Picture/Picture2.webp`,
        tag: "Print & Exhibition Prep",
        description: "Upscaled hyper-detailed abstract generative visuals for digital displays and billboards.",
        metrics: "300 DPI Vector Scale",
      },
    ],
    details: {
      description:
        "Harnessing cutting-edge AI technology, our team specializes in offering innovative AI Art. From stunning digital masterpieces to unique creations, we craft visually captivating artwork that pushes the boundaries of creativity. Entrust us to unleash the power of AI to produce mesmerizing artworks that inspire and delight. Unlock the potential of artificial intelligence to create stunning visual artwork that captivates and inspires. At Bharat DigiGuru, our Art Generation services harness the latest advancements in AI technology to produce unique and captivating artwork that reflects your brand's identity and vision. Whether you're looking for digital illustrations, graphics, or custom artwork, our AI-powered tools can bring your ideas to life with unparalleled precision and creativity. With our Art Generation services, you can unleash your imagination and explore new possibilities in visual storytelling and brand expression.",
      deliverables: [
        "Bespoke Generative Brand Art & Key Visuals",
        "Custom Digital Illustrations & Graphics",
        "High-Resolution Upscaling & Print Prep",
        "Custom Visual Styles & Prompt Libraries",
      ],
      chips: [
        "Custom AI Illustrations",
        "Generative Concept Art",
        "High-Resolution Upscaling",
        "Custom Aesthetics",
        "Prompt Engineering",
        "Commercial Assets",
      ],
      timeline: "24–48 Hour Turnaround",
    },
  },
  {
    id: "ai-video-generation",
    number: "(06)",
    title: "AI Video Generation",
    subtitle: "DYNAMIC PROMOTIONAL & NEXT-GEN VIDEO",
    tag: "& FUTURE OF VIDEO PRODUCTION",
    image: `${CLOUDFRONT_BASE}/assets/Picture/Picture3.webp`,
    works: [
      {
        id: "ai-vid-work-1",
        title: "Neural Motion Synthesis Ad",
        type: "video" as const,
        url: `${CLOUDFRONT_BASE}/assets/Picture/Picture3.webp`,
        thumbnail: `${CLOUDFRONT_BASE}/assets/Picture/Picture3.webp`,
        tag: "AI Commercial Teaser",
        description: "Generative video production with high-fidelity camera motion synthesis and VFX.",
        metrics: "10x Production Speed",
      },
      {
        id: "ai-vid-work-2",
        title: "Multilingual AI Voiceover & Avatar",
        type: "image" as const,
        url: `${CLOUDFRONT_BASE}/assets/Picture/Picture4.webp`,
        thumbnail: `${CLOUDFRONT_BASE}/assets/Picture/Picture4.webp`,
        tag: "AI Avatar & Localization",
        description: "Lip-synced video localization in 15+ languages with natural neural voiceovers.",
        metrics: "15 Languages • Real-time",
      },
      {
        id: "ai-vid-work-3",
        title: "High-Cadence Ad Variation Engine",
        type: "image" as const,
        url: `${CLOUDFRONT_BASE}/assets/Picture/Picture5.webp`,
        thumbnail: `${CLOUDFRONT_BASE}/assets/Picture/Picture5.webp`,
        tag: "Dynamic Ad Variants",
        description: "Rapid generation of 50+ video creative hooks for performance testing.",
        metrics: "50+ A/B Variations",
      },
    ],
    details: {
      description:
        "Delve into the future of video production with our AI-powered services, where innovation meets creativity. Our team leverages cutting-edge AI technology to produce captivating videos that leave a lasting impression. From dynamic promotional content to immersive storytelling, we craft visually stunning videos. Experience the future of video production with Bharat DigiGuru's AI Videos Generation services. Using cutting-edge artificial intelligence technology, we can create dynamic and engaging videos that capture attention and drive results. Whether you need promotional videos, explainer videos, or social media content, our AI-powered video creation tools can generate professional-quality videos in a fraction of the time and cost of traditional production methods. With our AI Videos Generation services, you can elevate your brand's video content and stand out in today's competitive digital landscape with ease and efficiency.",
      deliverables: [
        "Automated AI Promotional Video Creatives",
        "High-Cadence Social Video Variations",
        "AI Voiceover & Multilingual Dubbing",
        "Rapid Video Prototyping & Ad Testing",
      ],
      chips: [
        "AI Promotional Teasers",
        "Automated Explainer Videos",
        "Motion Synthesis",
        "AI Voiceovers",
        "Fast Ad Variations",
        "High-Cadence Production",
      ],
      timeline: "48–72 Hour Turnaround",
    },
  },
];

/**
 * Optional: Sync local assets to S3 so that CloudFront can deliver them directly
 */
async function syncLocalAssetsToS3() {
  if (!isS3Configured()) {
    console.log("ℹ️ S3 is not configured in environment. Skipping direct S3 asset upload.");
    return;
  }

  try {
    const { client, bucket } = getS3Client();
    const assetsDir = path.resolve(process.cwd(), "../Frontend/src/assets");
    if (!fs.existsSync(assetsDir)) {
      console.log(`ℹ️ Frontend assets directory not found at ${assetsDir}. Skipping S3 sync.`);
      return;
    }

    const scanAndUpload = async (dir: string, prefix = "assets") => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const s3Key = `${prefix}/${entry.name}`;
        if (entry.isDirectory()) {
          await scanAndUpload(fullPath, s3Key);
        } else if (entry.isFile()) {
          try {
            // Check if already in S3
            try {
              await client.send(new HeadObjectCommand({ Bucket: bucket, Key: s3Key }));
              // Already exists
              continue;
            } catch {
              // Not found -> Upload
            }

            const fileBuffer = fs.readFileSync(fullPath);
            const ext = path.extname(entry.name).toLowerCase();
            const mime =
              ext === ".webp"
                ? "image/webp"
                : ext === ".jpg" || ext === ".jpeg"
                ? "image/jpeg"
                : ext === ".png"
                ? "image/png"
                : ext === ".mp4"
                ? "video/mp4"
                : ext === ".webm"
                ? "video/webm"
                : "application/octet-stream";

            await client.send(
              new PutObjectCommand({
                Bucket: bucket,
                Key: s3Key,
                Body: fileBuffer,
                ContentType: mime,
                CacheControl: "public, max-age=31536000, immutable",
              })
            );
            console.log(`✅ Uploaded to AWS S3 & CloudFront CDN: ${s3Key}`);
          } catch (err: any) {
            console.warn(`⚠️ Could not upload ${s3Key} to S3:`, err.message);
          }
        }
      }
    };

    console.log("🚀 Checking and syncing local assets to AWS S3 bucket for CloudFront...");
    await scanAndUpload(assetsDir);
  } catch (err: any) {
    console.warn("⚠️ S3 sync encountered an issue:", err.message);
  }
}

/**
 * Seed MongoDB & Local DB JSON with Services Data
 */
async function seedServicesDatabase() {
  console.log("🌱 Starting Services Database Seeding...");

  // 1. Sync assets if S3 available
  await syncLocalAssetsToS3();

  // 2. Connect to MongoDB if MONGODB_URI is provided
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      console.log("📦 Connecting to MongoDB Atlas...");
      await mongoose.connect(mongoUri);
      console.log("✅ MongoDB Connected.");

      console.log("🧹 Clearing old services collection in MongoDB...");
      await Service.deleteMany({});

      console.log("📝 Inserting 6 full services with CloudFront CDN links into MongoDB...");
      await Service.insertMany(SERVICES_SEED_DATA);
      console.log("✅ Successfully seeded 6 Services in MongoDB Atlas!");
    } catch (err: any) {
      console.error("❌ MongoDB Seeding Error:", err.message);
    }
  } else {
    console.log("ℹ️ MONGODB_URI not found, skipping MongoDB Atlas seed.");
  }

  // 3. Update local DB JSON
  try {
    const dbJsonPath = path.resolve(process.cwd(), "data/db.json");
    if (fs.existsSync(dbJsonPath)) {
      const raw = fs.readFileSync(dbJsonPath, "utf-8");
      const data = JSON.parse(raw);
      data.services = SERVICES_SEED_DATA;
      fs.writeFileSync(dbJsonPath, JSON.stringify(data, null, 2), "utf-8");
      console.log("✅ Local data/db.json updated with 6 CloudFront Services!");
    }
  } catch (err: any) {
    console.warn("⚠️ Could not update local data/db.json:", err.message);
  }

  console.log("🎉 Services Seeding Complete!");
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(0);
}

seedServicesDatabase();
