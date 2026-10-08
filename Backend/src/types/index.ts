export interface IPortfolioItem {
  id: number | string;
  number?: string;
  category?: string;
  client?: string;
  year?: string;
  title: string;
  subtitle?: string;
  tags?: string[];
  description?: string;
  metrics?: string[];
  image?: string;
  video?: string;
  videoDuration?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IThreeDProject {
  id: string;
  title: string;
  category?: string;
  client?: string;
  year?: string;
  duration?: string;
  resolution?: string;
  software?: string[];
  description?: string;
  deliverables?: string[];
  videoUrl?: string;
  posterUrl?: string;
  stats?: {
    fps?: string;
    renderEngine?: string;
    turnaround?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface IInquiry {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  phone?: string;
  company?: string;
  services?: string[] | string;
  budget?: string;
  timeline?: string;
  message: string;
  status: "NEW" | "CONTACTED" | "ARCHIVED";
  createdAt: string;
  updatedAt?: string;
}

export type AdminRole = "managedAdmin" | "superAdmin" | "admin" | "superadmin" | "managedadmin";

export interface IAdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: AdminRole;
  resetPasswordOtp?: string;
  resetPasswordExpires?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IServiceWorkItem {
  id: string;
  title: string;
  type: "video" | "image" | "youtube";
  url: string;
  thumbnail?: string;
  tag: string;
  description?: string;
  metrics?: string;
  youtubeId?: string;
}

export interface IServiceItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  tag?: string;
  image?: string;
  works?: IServiceWorkItem[];
  details?: {
    deliverables: string[];
    timeline: string;
    description: string;
    chips?: string[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ITeamMember {
  id: string;
  name: string;
  role: string;
  column: number; // 1 to 5
  order?: number;
  image: string;
  bio?: string;
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IStorySlide {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  duration?: number;
  caption?: string;
  linkText?: string;
  linkUrl?: string;
}

export interface IStoryItem {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  coverImage?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  slides: IStorySlide[];
  isFeatured?: boolean;
  isActive?: boolean;
  order?: number;
  viewCount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IBlogItem {
  id: string;
  number?: string;
  category: string;
  title: string;
  description: string;
  readTime?: string;
  date?: string;
  image?: string;
  content: string[];
  bullets?: string[];
  isPublished?: boolean;
  order?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IDatabaseSchema {
  portfolio: IPortfolioItem[];
  threed: IThreeDProject[];
  services?: IServiceItem[];
  team?: ITeamMember[];
  stories?: IStoryItem[];
  blogs?: IBlogItem[];
  inquiries: IInquiry[];
  adminUser: IAdminUser;
  adminUsers?: IAdminUser[];
}


