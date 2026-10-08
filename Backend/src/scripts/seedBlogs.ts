import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BlogModel } from "../models/Blog.js";
import { IBlogItem } from "../types/index.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "../../data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export const BLOGS_SEED_DATA: IBlogItem[] = [
  {
    id: "empower-brands-digital-journey",
    number: "(01)",
    category: "Digital Acceleration",
    title: "Empower Your Brand's Digital Journey with Bharat DigiGuru",
    description:
      "In today's digital landscape, establishing a formidable online presence is essential for businesses striving to excel in competitive markets.",
    readTime: "6 MIN READ",
    date: "AUG 2026",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop&fm=webp",
    content: [
      "In today's digital landscape, establishing a formidable online presence is essential for businesses striving to excel in competitive markets. The ever-evolving nature of digital media can be overwhelming, but Bharat DigiGuru serves as a steadfast ally in navigating this dynamic terrain. Our extensive range of digital media services is meticulously crafted to enhance the brand's visibility, engagement, and profitability.",
      "Specializing in Social Media Marketing (SMM), Website Design and development, and more, Bharat DigiGuru tailors solutions to meet your business requirements. Whether seeking increased organic traffic, optimizing social media engagement, or streamlining lead generation, our team of experts is dedicated to realizing clients' objectives.",
      "In conclusion, Bharat DigiGuru is synonymous with innovation and expertise in digital media services. Our comprehensive offerings empower businesses to harness the full potential of the digital landscape, unlocking new opportunities for growth and success. Embark confidently on the brand's digital journey, backed by Bharat DigiGuru's unwavering commitment to excellence.",
    ],
    bullets: [
      "Elevate the brand's social media presence with expert Social Media Marketing Strategies",
      "Boost website visibility and organic traffic through tailored Search Engine Optimization (SEO) Services",
      "Enhance social media engagement and brand visibility with strategic Social Media Optimization (SMO) techniques",
      "Safeguard and manage online reputation effectively with Online Reputation Management (ORM) solutions",
      "Reach target audience and drive conversions with targeted Facebook, Google, and Instagram advertising campaigns",
      "Amplify brand presence and reach through innovative promotional strategies",
      "Increase video visibility and engagement with specialized YouTube promotion services",
      "Foster meaningful connections and engagement with the audience through WhatsApp Community management",
      "Streamline lead generation processes and drive efficiency with advanced Lead Automation services",
      "Generate high-quality leads and drive conversions with targeted lead-generation strategies",
      "Ensure consistency in messaging across all digital platforms with comprehensive Content Management solutions",
      "Boost customer relationships and drive conversions with personalized Email Marketing campaigns that resonate with the audience",
      "Create visually stunning, user-friendly websites that reflect the brand's identity and convert visitors into customers",
      "Support the website running smoothly and up-to-date with reliable Website Maintenance Services",
    ],
    isPublished: true,
    order: 1,
  },
  {
    id: "vital-role-digital-media-tech-era",
    number: "(02)",
    category: "Tech Era & Culture",
    title: "Embracing the Vital Role of Digital Media in the Technological Era",
    description:
      "The significance of digital media in the contemporary world cannot be overstated, serving as the cornerstone of our technological revolution.",
    readTime: "8 MIN READ",
    date: "AUG 2026",
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1000&auto=format&fit=crop&fm=webp",
    content: [
      "The significance of digital media in the contemporary world cannot be overstated. Technology permeates every aspect of our lives, and digital media stands as the cornerstone of this technological revolution. From communication and entertainment to education and commerce, digital media plays a pivotal role in shaping our daily experiences and interactions.",
      "One of the primary reasons for digital media's importance lies in its unparalleled reach and accessibility. Unlike traditional media forms such as print or broadcast, digital media transcends geographical boundaries and time constraints. High-speed internet and the advent of smartphones have opened up possibilities for people to access information and engage in entertainment anytime and anywhere. This accessibility has democratized the dissemination of knowledge and enabled individuals from diverse backgrounds to participate in the global discourse.",
      "Moreover, digital media serves as a powerful tool for communication and expression. Facebook, Twitter, and Instagram have revolutionized connecting and sharing information. These platforms have empowered individuals to amplify their voices, mobilize communities, and catalyze social change. From grassroots movements to viral trends, digital media has become the catalyst for shaping public opinion and driving conversations on important issues.",
      "Furthermore, digital media has transformed the landscape of education and learning. With the proliferation of online courses, tutorials, and educational resources, individuals now have unprecedented access to knowledge and skills development. Additionally, digital media has revolutionized the classroom experience, enabling educators to leverage interactive multimedia content and collaborative tools to enhance student engagement and comprehension.",
      "Digital media has ushered in an era of creativity and innovation in entertainment. Streaming platforms like Netflix, Hulu, and Spotify have disrupted traditional entertainment models, offering consumers a vast array of content tailored to their preferences. New-age technologies like Virtual Reality (VR) and Augmented Reality (AR) are pushing the boundaries of immersive storytelling, allowing audiences to experience narratives in unprecedented ways.",
      "From a business standpoint, digital media has become indispensable for marketing and commerce. E-commerce platforms like Amazon and Alibaba have transformed how we shop. Today, digital marketing strategies like search engine optimization (SEO), social media advertising, and content marketing are necessary for businesses to reach their target audiences and drive sales. In order to remain competitive and relevant, organizations must adapt and leverage digital media in a digital-first world.",
      "In conclusion, digital media is here to stay in this technological era, and its importance cannot be overstated. From communication and education to entertainment and commerce, digital media permeates every aspect of our lives, shaping how we interact, learn, and engage with the world.",
    ],
    isPublished: true,
    order: 2,
  },
  {
    id: "smm-seo-orm-synergy",
    number: "(03)",
    category: "SMM & ORM",
    title: "Safeguarding Reputation & Amplifying Social Footprint",
    description:
      "How integrated SMM, SMO, and Online Reputation Management build untouchable brand authority.",
    readTime: "5 MIN READ",
    date: "JUL 2026",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop&fm=webp",
    content: [
      "A brand's reputation takes years to build and seconds to tarnish in the viral social landscape. Online Reputation Management (ORM) is not damage control; it is proactive sentiment architecture.",
      "By harmonizing Social Media Optimization (SMO) with continuous sentiment monitoring, review curation, and proactive crisis protocols, we keep your brand's digital perception authoritative, credible, and pristine.",
      "Paired with targeted Social Media Marketing (SMM) strategies, your audience evolves from passive observers into vocal brand advocates.",
    ],
    isPublished: true,
    order: 3,
  },
  {
    id: "targeted-advertising-meta-google",
    number: "(04)",
    category: "Paid Media",
    title: "Precision Ads: Meta, Google, Instagram & YouTube",
    description:
      "High-return campaign architecture designed to capture high-intent buyers and scale customer acquisition.",
    readTime: "7 MIN READ",
    date: "JUL 2026",
    image: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?q=80&w=1000&auto=format&fit=crop&fm=webp",
    content: [
      "Throwing ad budget at generic audience buckets is a relic of the past. Modern algorithmic advertising requires precision segmentation, dynamic creative variations, and cross-channel remarketing.",
      "We build synchronized ad funnels spanning Meta (Facebook & Instagram Ads), Google Search & Display, and YouTube Promotions. Every dollar is tracked against downstream revenue metrics.",
      "Our campaigns do not just generate clicks — they capture qualified leads and drive direct sales with predictable, compounding ROI.",
    ],
    isPublished: true,
    order: 4,
  },
  {
    id: "lead-automation-nurturing",
    number: "(05)",
    category: "Lead Systems",
    title: "Lead Automation & WhatsApp Community Architecture",
    description:
      "Transforming cold traffic into warm relationships through automated workflows and direct messaging.",
    readTime: "6 MIN READ",
    date: "JUN 2026",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop&fm=webp",
    content: [
      "Speed to lead is the single most critical factor in modern sales conversion. Leads contacted within 5 minutes are 21 times more likely to enter the sales pipeline.",
      "With Bharat DigiGuru's advanced Lead Automation and WhatsApp Community management, new inquiries are instantly qualified, routed, and engaged with personalized value.",
      "Coupled with targeted email nurturing sequences, our systems turn intermittent prospect interest into loyal, repeat customer relationships.",
    ],
    isPublished: true,
    order: 5,
  },
  {
    id: "conversion-web-development",
    number: "(06)",
    category: "Web Engineering",
    title: "Visually Stunning, High-Conversion Web Architecture",
    description:
      "Creating modern digital storefronts that reflect your identity, captivate visitors, and convert traffic.",
    readTime: "5 MIN READ",
    date: "JUN 2026",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop&fm=webp",
    content: [
      "Your website is the ultimate digital flagship of your business. If it loads slowly, confuses navigation, or lacks aesthetic distinction, visitors bounce within seconds.",
      "Bharat DigiGuru designs and develops visually stunning, responsive, and ultra-fast websites engineered specifically to reflect your brand's unique identity while driving seamless conversions.",
      "Backed by ongoing Website Maintenance Services, we ensure your digital presence remains secure, up-to-date, and performing at peak efficiency 24/7.",
    ],
    isPublished: true,
    order: 6,
  },
];

async function seedBlogs() {
  console.log("==========================================");
  console.log("🚀 Starting Bharat DigiGuru Blogs Seeding");
  console.log("==========================================");

  // 1. Seed into MongoDB if configured
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/bharat-digiguru";
  let isMongoConnected = false;

  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
    isMongoConnected = true;
    console.log("✅ MongoDB connection established successfully.");

    console.log(`Clearing existing blogs and seeding ${BLOGS_SEED_DATA.length} blog posts...`);
    await BlogModel.deleteMany({});

    for (const blog of BLOGS_SEED_DATA) {
      await BlogModel.create(blog);
      console.log(`  ✓ [MongoDB] [${blog.number}] ${blog.title}`);
      console.log(`    ↳ Category: ${blog.category} | Image: ${blog.image ? "Attached" : "None"}`);
    }
    console.log("✅ MongoDB Blogs collection successfully updated.");
  } catch (mongoErr: any) {
    console.warn("⚠️ MongoDB connection skipped or failed:", mongoErr.message);
  } finally {
    if (isMongoConnected) {
      await mongoose.disconnect();
    }
  }

  // 2. Also persist to local JSON database (data/db.json) for 100% offline & fallback compatibility
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let localDb: any = {};
    if (fs.existsSync(DB_FILE)) {
      const fileData = fs.readFileSync(DB_FILE, "utf-8");
      try {
        localDb = JSON.parse(fileData);
      } catch {
        localDb = {};
      }
    }

    localDb.blogs = BLOGS_SEED_DATA;
    fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), "utf-8");
    console.log(`✅ Local JSON store (data/db.json) updated with ${BLOGS_SEED_DATA.length} blogs.`);
  } catch (fsErr: any) {
    console.error("❌ Failed to update local db.json:", fsErr.message);
  }

  console.log("==========================================");
  console.log("✨ Blogs & Images Seeding Completed Successfully!");
  console.log("==========================================");
  process.exit(0);
}

if (process.argv[1]?.includes("seedBlogs")) {
  seedBlogs().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
}
