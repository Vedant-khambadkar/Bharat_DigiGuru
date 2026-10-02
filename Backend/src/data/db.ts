import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { IDatabaseSchema, IPortfolioItem, IThreeDProject, IServiceItem, ITeamMember, IInquiry } from "../types/index.js";
import { getInitialSeedData } from "./seedData.js";
import {
  PortfolioModel,
  ThreeDModel,
  ServiceModel,
  TeamMemberModel,
  InquiryModel,
  AdminUserModel,
} from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "../../data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

class DatabaseStore {
  private localData: IDatabaseSchema;
  private isMongoConnected: boolean = false;

  constructor() {
    this.ensureDataDir();
    this.localData = this.loadLocalDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadLocalDatabase(): IDatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(fileContent);
        if (parsed && typeof parsed === "object") {
          const initialSeed = getInitialSeedData();
          const merged: IDatabaseSchema = {
            ...initialSeed,
            ...parsed,
          };
          // Ensure adminUsers exists
          if (!Array.isArray(merged.adminUsers) || merged.adminUsers.length === 0) {
            merged.adminUsers = [merged.adminUser || initialSeed.adminUser];
          }
          // Ensure services exists
          if (!Array.isArray(merged.services) || merged.services.length === 0) {
            merged.services = initialSeed.services || [];
          }
          return merged;
        }
      }
    } catch (err) {
      console.warn("⚠️ Failed to parse db.json, generating fresh seed data:", err);
    }

    const seed = getInitialSeedData();
    this.persistLocal(seed);
    return seed;
  }

  private persistLocal(dataToSave: IDatabaseSchema) {
    try {
      this.ensureDataDir();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(dataToSave, null, 2), "utf-8");
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error("❌ Failed to persist local db.json:", err);
    }
  }

  // ==========================================
  // MONGODB CONNECTION & AUTO-SEEDING
  // ==========================================
  public async connectMongo(uri?: string): Promise<boolean> {
    const mongoUri = uri || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log("ℹ️ No MONGODB_URI provided. Running in file-backed local database mode.");
      return false;
    }

    try {
      console.log("🔄 Connecting to MongoDB Cluster...");
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });

      this.isMongoConnected = true;
      console.log("🍃 [MONGODB] Connected successfully to MongoDB Atlas!");

      // Auto-seed MongoDB collections if empty
      await this.seedMongoIfEmpty();
      return true;
    } catch (err: any) {
      console.error("❌ [MONGODB CONNECTION ERROR]:", err.message);
      console.log("⚠️ Falling back to local JSON database store.");
      this.isMongoConnected = false;
      return false;
    }
  }

  private async seedMongoIfEmpty() {
    try {
      const seed = getInitialSeedData();

      // 1. Admin User
      const adminCount = await AdminUserModel.countDocuments();
      if (adminCount === 0) {
        await AdminUserModel.create(seed.adminUser);
        console.log("🌱 [MONGODB SEED] Initialized Admin User.");
      }

      // 2. Portfolio
      const portfolioCount = await PortfolioModel.countDocuments();
      if (portfolioCount === 0) {
        await PortfolioModel.insertMany(seed.portfolio);
        console.log(`🌱 [MONGODB SEED] Seeded ${seed.portfolio.length} Portfolio Projects.`);
      }

      // 3. 3D Studio
      const threedCount = await ThreeDModel.countDocuments();
      if (threedCount === 0) {
        await ThreeDModel.insertMany(seed.threed);
        console.log(`🌱 [MONGODB SEED] Seeded ${seed.threed.length} 3D Projects.`);
      }

      // 4. Services
      const servicesCount = await ServiceModel.countDocuments();
      if (servicesCount === 0 && seed.services && seed.services.length > 0) {
        await ServiceModel.insertMany(seed.services);
        console.log(`🌱 [MONGODB SEED] Seeded ${seed.services.length} Services.`);
      }

      // 5. Inquiries
      const inqCount = await InquiryModel.countDocuments();
      if (inqCount === 0 && seed.inquiries.length > 0) {
        await InquiryModel.insertMany(seed.inquiries);
        console.log(`🌱 [MONGODB SEED] Seeded ${seed.inquiries.length} Sample Inquiries.`);
      }
    } catch (seedErr: any) {
      console.error("⚠️ [MONGODB SEED ERROR]:", seedErr.message);
    }
  }

  // ==========================================
  // 1. PORTFOLIO (WITH SERVER-SIDE PAGINATION)
  // ==========================================
  public async getPortfolio(params?: PaginationParams): Promise<PaginatedResult<IPortfolioItem> | IPortfolioItem[]> {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.max(1, Number(params?.limit) || 10);
    const search = params?.search?.trim().toLowerCase();
    const category = params?.category?.trim();

    if (this.isMongoConnected) {
      const query: any = {};
      if (category && category !== "All") {
        query.category = { $regex: new RegExp(category, "i") };
      }
      if (search) {
        query.$or = [
          { title: { $regex: new RegExp(search, "i") } },
          { subtitle: { $regex: new RegExp(search, "i") } },
          { client: { $regex: new RegExp(search, "i") } },
          { description: { $regex: new RegExp(search, "i") } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      const total = await PortfolioModel.countDocuments(query);
      const totalPages = Math.ceil(total / limit) || 1;
      const skip = (page - 1) * limit;

      const items = (await PortfolioModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()) as unknown as IPortfolioItem[];

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    }

    // Local JSON fallback
    let list = [...this.localData.portfolio];
    if (category && category !== "All") {
      list = list.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(search) ||
          p.client?.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search)
      );
    }

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;
    const items = list.slice(skip, skip + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // Get all portfolio items without pagination for public site
  public async getAllPortfolio(): Promise<IPortfolioItem[]> {
    if (this.isMongoConnected) {
      return (await PortfolioModel.find().sort({ createdAt: -1 }).lean()) as unknown as IPortfolioItem[];
    }
    return this.localData.portfolio;
  }

  private buildIdQuery(id: string | number) {
    const orConditions: any[] = [{ id: id }, { id: String(id) }];

    const num = Number(id);
    if (!isNaN(num) && isFinite(num)) {
      orConditions.push({ id: num });
    }

    if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id)) {
      orConditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }

    return { $or: orConditions };
  }

  public async getPortfolioById(id: string | number) {
    if (this.isMongoConnected) {
      return await PortfolioModel.findOne(this.buildIdQuery(id)).lean();
    }
    return this.localData.portfolio.find((p) => String(p.id) === String(id) || (p as any)._id === String(id));
  }

  public async createPortfolio(item: any) {
    const newItem = {
      ...item,
      id: item.id || Date.now(),
    };

    if (this.isMongoConnected) {
      const doc = await PortfolioModel.create(newItem);
      return doc.toJSON();
    }

    this.localData.portfolio.unshift(newItem);
    this.persistLocal(this.localData);
    return newItem;
  }

  public async updatePortfolio(id: string | number, updates: any) {
    if (this.isMongoConnected) {
      const updated = await PortfolioModel.findOneAndUpdate(
        this.buildIdQuery(id),
        { $set: updates },
        { new: true }
      ).lean();
      return updated;
    }

    const idx = this.localData.portfolio.findIndex((p) => String(p.id) === String(id) || (p as any)._id === String(id));
    if (idx === -1) return null;
    this.localData.portfolio[idx] = {
      ...this.localData.portfolio[idx],
      ...updates,
      id: this.localData.portfolio[idx].id,
      updatedAt: new Date().toISOString(),
    };
    this.persistLocal(this.localData);
    return this.localData.portfolio[idx];
  }

  public async deletePortfolio(id: string | number) {
    if (this.isMongoConnected) {
      const res = await PortfolioModel.deleteOne(this.buildIdQuery(id));
      return res.deletedCount > 0;
    }

    const initialLen = this.localData.portfolio.length;
    this.localData.portfolio = this.localData.portfolio.filter((p) => String(p.id) !== String(id) && (p as any)._id !== String(id));
    if (this.localData.portfolio.length !== initialLen) {
      this.persistLocal(this.localData);
      return true;
    }
    return false;
  }

  // ==========================================
  // 2. 3D STUDIO (WITH SERVER-SIDE PAGINATION)
  // ==========================================
  public async getThreeD(params?: PaginationParams): Promise<PaginatedResult<IThreeDProject> | IThreeDProject[]> {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.max(1, Number(params?.limit) || 10);
    const search = params?.search?.trim().toLowerCase();
    const category = params?.category?.trim();

    if (this.isMongoConnected) {
      const query: any = {};
      if (category && category !== "All") {
        query.category = { $regex: new RegExp(category, "i") };
      }
      if (search) {
        query.$or = [
          { title: { $regex: new RegExp(search, "i") } },
          { client: { $regex: new RegExp(search, "i") } },
          { description: { $regex: new RegExp(search, "i") } },
        ];
      }

      const total = await ThreeDModel.countDocuments(query);
      const totalPages = Math.ceil(total / limit) || 1;
      const skip = (page - 1) * limit;

      const items = (await ThreeDModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()) as unknown as IThreeDProject[];

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    }

    // Local JSON fallback
    let list = [...this.localData.threed];
    if (category && category !== "All") {
      list = list.filter((t) => t.category?.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      list = list.filter(
        (t) =>
          t.title?.toLowerCase().includes(search) ||
          t.client?.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search)
      );
    }

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;
    const items = list.slice(skip, skip + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // Get all 3D projects without pagination for public site
  public async getAllThreeD(): Promise<IThreeDProject[]> {
    if (this.isMongoConnected) {
      return (await ThreeDModel.find().sort({ createdAt: -1 }).lean()) as unknown as IThreeDProject[];
    }
    return this.localData.threed;
  }

  public async getThreeDById(id: string) {
    if (this.isMongoConnected) {
      return await ThreeDModel.findOne(this.buildIdQuery(id)).lean();
    }
    return this.localData.threed.find((t) => String(t.id) === String(id) || (t as any)._id === String(id));
  }

  public async createThreeD(item: any) {
    const newItem = {
      ...item,
      id: item.id || `threed-${Date.now()}`,
    };

    if (this.isMongoConnected) {
      const doc = await ThreeDModel.create(newItem);
      return doc.toJSON();
    }

    this.localData.threed.unshift(newItem);
    this.persistLocal(this.localData);
    return newItem;
  }

  public async updateThreeD(id: string, updates: any) {
    if (this.isMongoConnected) {
      const updated = await ThreeDModel.findOneAndUpdate(
        this.buildIdQuery(id),
        { $set: updates },
        { new: true }
      ).lean();
      return updated;
    }

    const idx = this.localData.threed.findIndex((t) => String(t.id) === String(id) || (t as any)._id === String(id));
    if (idx === -1) return null;
    this.localData.threed[idx] = {
      ...this.localData.threed[idx],
      ...updates,
      id: this.localData.threed[idx].id,
      updatedAt: new Date().toISOString(),
    };
    this.persistLocal(this.localData);
    return this.localData.threed[idx];
  }

  public async deleteThreeD(id: string) {
    if (this.isMongoConnected) {
      const res = await ThreeDModel.deleteOne(this.buildIdQuery(id));
      return res.deletedCount > 0;
    }

    const initialLen = this.localData.threed.length;
    this.localData.threed = this.localData.threed.filter((t) => String(t.id) !== String(id) && (t as any)._id !== String(id));
    if (this.localData.threed.length !== initialLen) {
      this.persistLocal(this.localData);
      return true;
    }
    return false;
  }

  // ==========================================
  // 3. SERVICES (WITH SERVER-SIDE PAGINATION)
  // ==========================================
  public async getServices(params?: PaginationParams): Promise<PaginatedResult<IServiceItem> | IServiceItem[]> {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.max(1, Number(params?.limit) || 10);
    const search = params?.search?.trim().toLowerCase();

    if (this.isMongoConnected) {
      const query: any = {};
      if (search) {
        query.$or = [
          { title: { $regex: new RegExp(search, "i") } },
          { subtitle: { $regex: new RegExp(search, "i") } },
          { "details.description": { $regex: new RegExp(search, "i") } },
          { "details.chips": { $in: [new RegExp(search, "i")] } },
          { "details.deliverables": { $in: [new RegExp(search, "i")] } },
        ];
      }

      const total = await ServiceModel.countDocuments(query);
      const totalPages = Math.ceil(total / limit) || 1;
      const skip = (page - 1) * limit;

      const items = (await ServiceModel.find(query)
        .sort({ number: 1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean()) as unknown as IServiceItem[];

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    }

    // Local JSON fallback
    let list = [...(this.localData.services || [])];
    if (search) {
      list = list.filter(
        (s) =>
          s.title?.toLowerCase().includes(search) ||
          s.subtitle?.toLowerCase().includes(search) ||
          s.details?.description?.toLowerCase().includes(search) ||
          s.details?.chips?.some((c) => c.toLowerCase().includes(search)) ||
          s.details?.deliverables?.some((d) => d.toLowerCase().includes(search))
      );
    }

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;
    const items = list.slice(skip, skip + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  // Get all services without pagination for public site
  public async getAllServices(): Promise<IServiceItem[]> {
    if (this.isMongoConnected) {
      return (await ServiceModel.find().sort({ number: 1, createdAt: 1 }).lean()) as unknown as IServiceItem[];
    }
    return this.localData.services || [];
  }

  public async getServiceById(id: string) {
    if (this.isMongoConnected) {
      return await ServiceModel.findOne(this.buildIdQuery(id)).lean();
    }
    return (this.localData.services || []).find((s) => String(s.id) === String(id) || (s as any)._id === String(id));
  }

  public async createService(item: any) {
    const newItem = {
      ...item,
      id: item.id || `service-${Date.now()}`,
    };

    if (this.isMongoConnected) {
      const doc = await ServiceModel.create(newItem);
      return doc.toJSON();
    }

    if (!this.localData.services) {
      this.localData.services = [];
    }
    this.localData.services.push(newItem);
    this.persistLocal(this.localData);
    return newItem;
  }

  public async updateService(id: string, updates: any) {
    if (this.isMongoConnected) {
      const updated = await ServiceModel.findOneAndUpdate(
        this.buildIdQuery(id),
        { $set: updates },
        { new: true }
      ).lean();
      return updated;
    }

    if (!this.localData.services) {
      this.localData.services = [];
    }
    const idx = this.localData.services.findIndex((s) => String(s.id) === String(id) || (s as any)._id === String(id));
    if (idx === -1) return null;
    this.localData.services[idx] = {
      ...this.localData.services[idx],
      ...updates,
      id: this.localData.services[idx].id,
      updatedAt: new Date().toISOString(),
    };
    this.persistLocal(this.localData);
    return this.localData.services[idx];
  }

  public async deleteService(id: string) {
    if (this.isMongoConnected) {
      const res = await ServiceModel.deleteOne(this.buildIdQuery(id));
      return res.deletedCount > 0;
    }

    if (!this.localData.services) {
      this.localData.services = [];
    }
    const initialLen = this.localData.services.length;
    this.localData.services = this.localData.services.filter((s) => String(s.id) !== String(id) && (s as any)._id !== String(id));
    if (this.localData.services.length !== initialLen) {
      this.persistLocal(this.localData);
      return true;
    }
    return false;
  }

  // ==========================================
  // 4. INQUIRIES (WITH SERVER-SIDE PAGINATION)
  // ==========================================
  public async getInquiries(params?: PaginationParams): Promise<PaginatedResult<IInquiry> | IInquiry[]> {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.max(1, Number(params?.limit) || 10);
    const status = params?.status?.trim().toUpperCase();
    const search = params?.search?.trim().toLowerCase();

    if (this.isMongoConnected) {
      const query: any = {};
      if (status && status !== "ALL") {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { name: { $regex: new RegExp(search, "i") } },
          { email: { $regex: new RegExp(search, "i") } },
          { company: { $regex: new RegExp(search, "i") } },
          { message: { $regex: new RegExp(search, "i") } },
        ];
      }

      const total = await InquiryModel.countDocuments(query);
      const totalPages = Math.ceil(total / limit) || 1;
      const skip = (page - 1) * limit;

      const items = (await InquiryModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()) as unknown as IInquiry[];

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    }

    // Local JSON fallback
    let list = [...this.localData.inquiries];
    if (status && status !== "ALL") {
      list = list.filter((i) => i.status?.toUpperCase() === status);
    }
    if (search) {
      list = list.filter(
        (i) =>
          i.name?.toLowerCase().includes(search) ||
          i.email?.toLowerCase().includes(search) ||
          i.company?.toLowerCase().includes(search) ||
          i.message?.toLowerCase().includes(search)
      );
    }

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;
    const items = list.slice(skip, skip + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  public async getInquiryById(id: string) {
    if (this.isMongoConnected) {
      return await InquiryModel.findOne(this.buildIdQuery(id)).lean();
    }
    return this.localData.inquiries.find((i) => String(i.id) === String(id) || (i as any)._id === String(id));
  }

  public async createInquiry(item: any) {
    const newInquiry = {
      ...item,
      id: item.id || `inq-${Date.now()}`,
      status: item.status || "NEW",
    };

    if (this.isMongoConnected) {
      const doc = await InquiryModel.create(newInquiry);
      return doc.toJSON();
    }

    this.localData.inquiries.unshift(newInquiry);
    this.persistLocal(this.localData);
    return newInquiry;
  }

  public async updateInquiryStatus(id: string, status: "NEW" | "CONTACTED" | "ARCHIVED") {
    if (this.isMongoConnected) {
      const updated = await InquiryModel.findOneAndUpdate(
        this.buildIdQuery(id),
        { $set: { status } },
        { new: true }
      ).lean();
      return updated;
    }

    const idx = this.localData.inquiries.findIndex((i) => String(i.id) === String(id) || (i as any)._id === String(id));
    if (idx === -1) return null;
    this.localData.inquiries[idx] = {
      ...this.localData.inquiries[idx],
      status,
      updatedAt: new Date().toISOString(),
    };
    this.persistLocal(this.localData);
    return this.localData.inquiries[idx];
  }

  public async deleteInquiry(id: string) {
    if (this.isMongoConnected) {
      const res = await InquiryModel.deleteOne(this.buildIdQuery(id));
      return res.deletedCount > 0;
    }

    const initialLen = this.localData.inquiries.length;
    this.localData.inquiries = this.localData.inquiries.filter((i) => String(i.id) !== String(id) && (i as any)._id !== String(id));
    if (this.localData.inquiries.length !== initialLen) {
      this.persistLocal(this.localData);
      return true;
    }
    return false;
  }

  // ==========================================
  // ADMIN AUTH & MULTI-USER MANAGEMENT
  // ==========================================
  public async getAdminUser() {
    if (this.isMongoConnected) {
      const user = await AdminUserModel.findOne().lean();
      if (user) return user;
    }
    return this.localData.adminUsers?.[0] || this.localData.adminUser;
  }

  public async getAdminUsers() {
    if (this.isMongoConnected) {
      const users = await AdminUserModel.find()
        .sort({ createdAt: -1 })
        .select("-passwordHash -resetPasswordOtp -resetPasswordExpires")
        .lean();
      return users;
    }

    const list = this.localData.adminUsers || [this.localData.adminUser];
    return list.map((u) => {
      const { passwordHash, resetPasswordOtp, resetPasswordExpires, ...safe } = u as any;
      return safe;
    });
  }

  public async getAdminUserById(id: string) {
    if (this.isMongoConnected) {
      return await AdminUserModel.findOne(this.buildIdQuery(id)).lean();
    }
    const list = this.localData.adminUsers || [this.localData.adminUser];
    return list.find((u) => String(u.id) === String(id) || (u as any)._id === String(id));
  }

  public async getAdminUserByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (this.isMongoConnected) {
      const user = await AdminUserModel.findOne({ email: normalizedEmail }).lean();
      if (user) return user;
      return null;
    }

    const list = this.localData.adminUsers || [this.localData.adminUser];
    const found = list.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (found) return found;

    if (this.localData.adminUser?.email.toLowerCase() === normalizedEmail) {
      return this.localData.adminUser;
    }
    return null;
  }

  public async createAdminUser(userData: {
    id?: string;
    email: string;
    passwordHash: string;
    name: string;
    role: any;
    createdBy?: string;
  }) {
    const newAdmin = {
      ...userData,
      id: userData.id || `admin-${Date.now()}`,
      email: userData.email.toLowerCase().trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.isMongoConnected) {
      const doc = await AdminUserModel.create(newAdmin);
      const res = doc.toJSON();
      return res;
    }

    if (!this.localData.adminUsers) {
      this.localData.adminUsers = [this.localData.adminUser];
    }

    this.localData.adminUsers.unshift(newAdmin);
    this.persistLocal(this.localData);
    const { passwordHash, ...safe } = newAdmin;
    return safe;
  }

  public async deleteAdminUser(id: string) {
    if (this.isMongoConnected) {
      const res = await AdminUserModel.deleteOne(this.buildIdQuery(id));
      return res.deletedCount > 0;
    }

    if (!this.localData.adminUsers) {
      this.localData.adminUsers = [this.localData.adminUser];
    }

    const initialLen = this.localData.adminUsers.length;
    this.localData.adminUsers = this.localData.adminUsers.filter(
      (u) => String(u.id) !== String(id) && (u as any)._id !== String(id)
    );

    if (this.localData.adminUsers.length !== initialLen) {
      this.persistLocal(this.localData);
      return true;
    }
    return false;
  }

  public async setAdminResetOtp(email: string, otp: string, expiresAt: Date) {
    const normalizedEmail = email.trim().toLowerCase();
    if (this.isMongoConnected) {
      let doc = await AdminUserModel.findOne({ email: normalizedEmail });
      if (!doc) {
        doc = await AdminUserModel.findOne();
      }
      if (doc) {
        doc.resetPasswordOtp = otp;
        doc.resetPasswordExpires = expiresAt;
        await doc.save();
      }
      return;
    }

    if (this.localData.adminUsers) {
      const admin = this.localData.adminUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (admin) {
        admin.resetPasswordOtp = otp;
        admin.resetPasswordExpires = expiresAt.toISOString();
        this.persistLocal(this.localData);
        return;
      }
    }

    this.localData.adminUser.resetPasswordOtp = otp;
    this.localData.adminUser.resetPasswordExpires = expiresAt.toISOString();
    this.persistLocal(this.localData);
  }

  public async getAdminUserWithOtp(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (this.isMongoConnected) {
      let doc = await AdminUserModel.findOne({ email: normalizedEmail }).lean();
      if (!doc) {
        doc = await AdminUserModel.findOne().lean();
      }
      return doc;
    }

    if (this.localData.adminUsers) {
      const admin = this.localData.adminUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (admin) return admin;
    }

    return this.localData.adminUser;
  }

  public async resetAdminPassword(email: string, newPasswordHash: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (this.isMongoConnected) {
      let doc = await AdminUserModel.findOne({ email: normalizedEmail });
      if (!doc) {
        doc = await AdminUserModel.findOne();
      }
      if (doc) {
        doc.passwordHash = newPasswordHash;
        doc.resetPasswordOtp = undefined;
        doc.resetPasswordExpires = undefined;
        await doc.save();
        return doc.toJSON();
      }
      return null;
    }

    if (this.localData.adminUsers) {
      const admin = this.localData.adminUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (admin) {
        admin.passwordHash = newPasswordHash;
        delete admin.resetPasswordOtp;
        delete admin.resetPasswordExpires;
        this.persistLocal(this.localData);
        return admin;
      }
    }

    this.localData.adminUser.passwordHash = newPasswordHash;
    delete this.localData.adminUser.resetPasswordOtp;
    delete this.localData.adminUser.resetPasswordExpires;
    this.persistLocal(this.localData);
    return this.localData.adminUser;
  }

  // =========================================================================
  // TEAM MEMBERS
  // =========================================================================
  public async getAllTeamMembers(): Promise<ITeamMember[]> {
    if (this.isMongoConnected) {
      const docs = await TeamMemberModel.find({ isActive: true }).sort({ column: 1, order: 1, createdAt: 1 });
      return docs.map((d) => d.toJSON() as unknown as ITeamMember);
    }
    if (!this.localData.team) {
      this.localData.team = [];
    }
    return this.localData.team.filter((t) => t.isActive !== false);
  }

  public async getTeamMembersAdmin(params?: {
    page?: number;
    limit?: number;
    search?: string;
    column?: string | number;
  }): Promise<PaginatedResult<ITeamMember> | ITeamMember[]> {
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.max(1, Number(params?.limit) || 10);
    const search = params?.search?.trim().toLowerCase();
    const column = params?.column && params.column !== "ALL" ? Number(params.column) : undefined;

    if (this.isMongoConnected) {
      const query: any = {};
      if (column) {
        query.column = column;
      }
      if (search) {
        query.$or = [
          { name: { $regex: new RegExp(search, "i") } },
          { role: { $regex: new RegExp(search, "i") } },
          { bio: { $regex: new RegExp(search, "i") } },
        ];
      }

      const total = await TeamMemberModel.countDocuments(query);
      const totalPages = Math.ceil(total / limit) || 1;
      const skip = (page - 1) * limit;

      const items = (await TeamMemberModel.find(query)
        .sort({ column: 1, order: 1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean()) as unknown as ITeamMember[];

      return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    }

    let list = [...(this.localData.team || [])];
    if (column) {
      list = list.filter((t) => Number(t.column) === column);
    }
    if (search) {
      list = list.filter(
        (t) =>
          t.name?.toLowerCase().includes(search) ||
          t.role?.toLowerCase().includes(search) ||
          t.bio?.toLowerCase().includes(search)
      );
    }

    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;
    const items = list.slice(skip, skip + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  public async getTeamMemberById(id: string): Promise<ITeamMember | null> {
    if (this.isMongoConnected) {
      const doc = await TeamMemberModel.findOne({ id });
      return doc ? (doc.toJSON() as unknown as ITeamMember) : null;
    }
    const item = (this.localData.team || []).find((t) => t.id === id);
    return item || null;
  }

  public async createTeamMember(data: Partial<ITeamMember>): Promise<ITeamMember> {
    const id = data.id || `team-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newMember: ITeamMember = {
      id,
      name: data.name || "Unnamed Member",
      role: data.role || "Team Member",
      column: data.column && data.column >= 1 && data.column <= 5 ? Number(data.column) : 1,
      order: data.order !== undefined ? Number(data.order) : 0,
      image: data.image || "",
      bio: data.bio || "",
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.isMongoConnected) {
      const doc = new TeamMemberModel(newMember);
      await doc.save();
      return doc.toJSON() as unknown as ITeamMember;
    }

    if (!this.localData.team) {
      this.localData.team = [];
    }
    this.localData.team.push(newMember);
    this.persistLocal(this.localData);
    return newMember;
  }

  public async updateTeamMember(id: string, data: Partial<ITeamMember>): Promise<ITeamMember | null> {
    if (this.isMongoConnected) {
      const doc = await TeamMemberModel.findOneAndUpdate(
        { id },
        { ...data, updatedAt: new Date() },
        { new: true }
      );
      return doc ? (doc.toJSON() as unknown as ITeamMember) : null;
    }

    if (!this.localData.team) this.localData.team = [];
    const idx = this.localData.team.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    this.localData.team[idx] = {
      ...this.localData.team[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.persistLocal(this.localData);
    return this.localData.team[idx];
  }

  public async deleteTeamMember(id: string): Promise<boolean> {
    if (this.isMongoConnected) {
      const res = await TeamMemberModel.deleteOne({ id });
      return res.deletedCount > 0;
    }

    if (!this.localData.team) return false;
    const initialLen = this.localData.team.length;
    this.localData.team = this.localData.team.filter((t) => t.id !== id);
    if (this.localData.team.length !== initialLen) {
      this.persistLocal(this.localData);
      return true;
    }
    return false;
  }
}

export const db = new DatabaseStore();

