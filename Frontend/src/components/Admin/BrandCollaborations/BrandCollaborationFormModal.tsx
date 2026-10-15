import React, { useState, useEffect, useRef } from "react";
import { X, UploadCloud, AlertCircle, Check, Loader2, Sparkles } from "lucide-react";
import type { BrandCollaboration } from "../../../types/brand";

interface BrandCollaborationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: BrandCollaboration | null;
  totalBrandsCount?: number;
}

const MAX_FILE_SIZE_BYTES = 1_000_000; // Strict 1 MB (1,000,000 bytes)
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export const BrandCollaborationFormModal: React.FC<BrandCollaborationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  totalBrandsCount = 0,
}) => {
  const [name, setName] = useState("");
  const [altText, setAltText] = useState("");
  const [order, setOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form state
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setAltText(initialData.altText || "");
      setOrder(initialData.order ?? 1);
      setIsActive(initialData.isActive ?? true);
      setSelectedFile(null);
      setPreviewUrl(initialData.logoUrl || "");
      setErrorMessage(null);
    } else {
      setName("");
      setAltText("");
      setOrder(totalBrandsCount + 1);
      setIsActive(true);
      setSelectedFile(null);
      setPreviewUrl("");
      setErrorMessage(null);
    }
  }, [initialData, totalBrandsCount, isOpen]);

  // Clean up object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);

    // 1. File size validation (Strict 1 MB limit)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeKb = (file.size / 1000).toFixed(1);
      setErrorMessage(
        `File exceeds maximum upload size limit of 1 MB (1,000,000 bytes). Selected file is ${sizeKb} KB. Please compress or select a smaller image.`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 2. Extension & MIME validation
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);
    const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) || file.type.startsWith("image/");

    if (!isAllowedExt && !isAllowedMime) {
      setErrorMessage(
        `Unsupported file format "${ext}". Please upload a PNG, JPG, JPEG, or WebP image.`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const objUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Please enter a brand name.");
      return;
    }

    if (!initialData && !selectedFile) {
      setErrorMessage("Please select a brand logo image.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", trimmedName);
      formData.append("altText", altText.trim() || trimmedName);
      formData.append("order", String(order || 1));
      formData.append("isActive", String(isActive));

      if (selectedFile) {
        formData.append("logo", selectedFile);
      }

      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      console.error("Form submit error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to save brand.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#141824] to-[#0c0e15] border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden my-8">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-['Syne',sans-serif] font-bold text-lg sm:text-xl text-white">
                {initialData ? "Edit Brand (Brands Trust Us)" : "Add Brand (Brands Trust Us)"}
              </h3>
              <p className="font-mono text-xs text-neutral-400">
                Automatic WebP conversion &amp; live website synchronization
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-5">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 flex items-start gap-3 text-xs font-mono">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Brand Name */}
          <div>
            <label className="block text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Brand Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Google, Sony, Red Bull, Spotify"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 font-sans text-sm focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Logo Upload & WebP Conversion Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
                Brand Logo <span className="text-red-400">{initialData ? "" : "*"}</span>
              </label>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Auto-converts to WebP (Max 1 MB)
              </span>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-red-500 bg-red-500/10"
                  : previewUrl
                  ? "border-white/20 bg-black/30 hover:border-white/30"
                  : "border-white/10 bg-black/20 hover:border-white/25 hover:bg-black/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="hidden"
              />

              {previewUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                  {/* Logo Preview Container with Checkerboard / Neutral Background for Transparency */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#1a1e2d] border border-white/15 p-2 flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden group">
                    <img
                      src={previewUrl}
                      alt="Brand Logo Preview"
                      className="max-w-full max-h-full object-contain filter drop-shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[11px] font-mono text-white text-center p-1">
                      Change Logo
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {selectedFile ? "Ready for WebP Conversion" : "Stored WebP Asset"}
                      </span>
                      {selectedFile && (
                        <span className="text-[10px] font-mono text-neutral-400">
                          {(selectedFile.size / 1000).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-white truncate mb-1">
                      {selectedFile ? selectedFile.name : initialData?.logoUrl?.split("/").pop() || "Logo asset"}
                    </p>
                    <p className="font-mono text-[11px] text-neutral-400">
                      Transparent backgrounds and original aspect ratio are automatically preserved.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-4 flex flex-col items-center justify-center gap-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-white hover:text-red-400 transition-colors">
                      Click to upload
                    </span>{" "}
                    <span className="font-mono text-xs text-neutral-400">or drag and drop</span>
                  </div>
                  <p className="font-mono text-[11px] text-neutral-500">
                    PNG, JPG, JPEG, or WebP (Strictly &le; 1 MB / 1,000,000 bytes)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Alt Text */}
          <div>
            <label className="block text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider mb-2">
              Alt Text (Accessibility)
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder={name ? `${name} logo` : "Descriptive text for screen readers"}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 font-sans text-sm focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Row: Display Order & Status Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Order */}
            <div>
              <label className="block text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                disabled={isSubmitting}
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 font-mono text-sm focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40 transition-colors disabled:opacity-50"
              />
              <span className="block text-[10px] font-mono text-neutral-500 mt-1">
                Lower numbers appear first on the public slider.
              </span>
            </div>

            {/* Visibility Toggle */}
            <div>
              <label className="block text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Visibility Status
              </label>
              <div className="flex items-center gap-3 h-[46px] px-4 rounded-xl bg-black/40 border border-white/10">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isActive ? "bg-emerald-500" : "bg-neutral-700"
                  }`}
                  role="switch"
                  aria-checked={isActive}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className={`font-mono text-xs font-bold ${isActive ? "text-emerald-400" : "text-neutral-500"}`}>
                  {isActive ? "Active (Live on Website)" : "Inactive (Hidden)"}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 mt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-mono text-xs text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Converting &amp; Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>{initialData ? "Update Brand" : "Create Brand"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
