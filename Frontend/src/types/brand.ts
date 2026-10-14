export interface BrandCollaboration {
  id: string;
  _id?: string;
  name: string;
  logoUrl: string;
  altText?: string;
  order: number;
  isActive: boolean;
  originalFormat?: string;
  format?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandCollaborationFormData {
  name: string;
  altText?: string;
  order?: number;
  isActive?: boolean;
  logoFile?: File | null;
}
