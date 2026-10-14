import React, { useState } from "react";
import {
  X,
  Trash2,
  CheckCircle,
  UploadCloud,
  Loader2,
  Plus,
  Crown,
  FileVideo,
  FileText,
  Sparkles,
} from "lucide-react";
import CachedImage from "../../CachedImage";
import { RichTextEditor } from "../RichTextEditor";
import { adminService } from "../../../services/service/adminService";

export interface EditingItemState {
  type: "portfolio" | "services" | "team" | "blogs" | "threed" | "founder";
  isNew: boolean;
  data: any;
}

interface ItemEditorModalProps {
  editingItem: EditingItemState | null;
  setEditingItem: React.Dispatch<React.SetStateAction<EditingItemState | null>>;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  handleFileUpload: (
    file: File,
    targetField: "image" | "videoUrl" | "workUrl" | "workThumbnail",
    workIndex?: number
  ) => Promise<void>;
  handleMultipleBlogMediaUpload: (fileList: FileList | File[]) => Promise<void>;
  isUploading: boolean;
  uploadProgress: string | null;
  showNotification: (msg: string, type?: "success" | "error") => void;
}

export const ItemEditorModal: React.FC<ItemEditorModalProps> = ({
  editingItem,
  setEditingItem,
  onClose,
  onSave,
  handleFileUpload,
  handleMultipleBlogMediaUpload,
  isUploading,
  uploadProgress,
  showNotification,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [activeWorkDrop, setActiveWorkDrop] = useState<string | null>(null);

  if (!editingItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#11131b] border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
          <h3 className="font-['Syne',sans-serif] font-bold text-base sm:text-xl text-white">
            {editingItem.isNew ? "Create New" : "Edit"}{" "}
            {editingItem.type === "portfolio"
              ? "Portfolio Project"
              : editingItem.type === "services"
              ? "Service Capability"
              : editingItem.type === "team"
              ? "Team Member"
              : editingItem.type === "founder"
              ? "Founder Profile"
              : editingItem.type === "blogs"
              ? "Blog Article"
              : "3D Showcase Video"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSave} className="flex flex-col gap-3.5">
          {/* =========================================================================
              PORTFOLIO SPECIFIC FIELDS
             ========================================================================= */}
          {editingItem.type === "portfolio" && (
            <>
              <div className="flex flex-col gap-1 text-left">
                <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase">
                  Title
                </label>
                <input
                  type="text"
                  value={editingItem.data.title || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, title: e.target.value },
                    })
                  }
                  placeholder="e.g. Next-Gen Financial Cloud"
                  className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="flex flex-col gap-1 text-left">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase">
                    Client
                  </label>
                  <input
                    type="text"
                    value={editingItem.data.client || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, client: e.target.value },
                      })
                    }
                    placeholder="e.g. Apex Global"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingItem.data.category || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, category: e.target.value },
                      })
                    }
                    placeholder="AI & Automation, Branding..."
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="flex flex-col gap-1 text-left">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={editingItem.data.subtitle || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, subtitle: e.target.value },
                      })
                    }
                    placeholder="e.g. Enterprise Cloud UI"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase">
                    Year
                  </label>
                  <input
                    type="text"
                    value={editingItem.data.year || "2026"}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, year: e.target.value },
                      })
                    }
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>
              </div>

              {/* Portfolio Image Drag & Drop Upload */}
              <div className="flex flex-col gap-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Project Cover Image (Drag & Drop)
                  </label>
                  {editingItem.data.image && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, image: "" },
                        })
                      }
                      className="text-[10px] font-mono text-red-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  )}
                </div>

                {editingItem.data.image ? (
                  <div className="relative rounded-2xl overflow-hidden border border-blue-500/30 bg-black/40 p-2.5 flex items-center gap-3">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 relative">
                      <CachedImage
                        src={editingItem.data.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <span className="font-mono text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle size={12} /> Image Attached
                      </span>
                      <p className="font-mono text-[10px] text-neutral-400 truncate max-w-full">
                        {editingItem.data.image}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <label className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-bold cursor-pointer transition-colors active:scale-95 inline-flex items-center gap-1">
                          <UploadCloud size={11} />
                          <span>Replace Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFileUpload(f, "image");
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) handleFileUpload(f, "image");
                    }}
                    className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      dragActive
                        ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                        : "border-white/15 hover:border-blue-500/50 bg-[#181a24]/60 hover:bg-[#181a24]"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, "image");
                      }}
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        <span className="text-xs font-mono text-blue-300">
                          {uploadProgress || "Uploading image..."}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                          <UploadCloud size={20} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs font-semibold text-white">
                            Drag & drop cover image here, or{" "}
                            <span className="text-blue-400 underline">browse</span>
                          </p>
                          <p className="text-[10px] font-mono text-neutral-400">
                            Supports PNG, JPG, WebP, SVG (Max 50MB)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Optional URL Fallback */}
                <div className="pt-0.5">
                  <input
                    type="text"
                    value={editingItem.data.image || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, image: e.target.value },
                      })
                    }
                    placeholder="Or paste image link (https://...)"
                    className="w-full bg-[#181a24]/50 border border-white/5 rounded-lg px-2.5 py-1 text-[11px] font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingItem.data.description || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, description: e.target.value },
                    })
                  }
                  placeholder="Project summary..."
                  className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={
                    Array.isArray(editingItem.data.tags)
                      ? editingItem.data.tags.join(", ")
                      : editingItem.data.tags || ""
                  }
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: {
                        ...editingItem.data,
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                  placeholder="React, Three.js, AI, Automation"
                  className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                />
              </div>
            </>
          )}

          {/* =========================================================================
              SERVICES SPECIFIC FIELDS
             ========================================================================= */}
          {editingItem.type === "services" && (
            <div className="flex flex-col gap-4 text-left">
              {/* Number & Tag row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Service Index (Number)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.data.number || "(01)"}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, number: e.target.value },
                      })
                    }
                    placeholder="(01)"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Tagline / Category Badge
                  </label>
                  <input
                    type="text"
                    value={editingItem.data.tag || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, tag: e.target.value },
                      })
                    }
                    placeholder="& 360° DIGITAL ACCELERATION"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Service Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.data.title || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, title: e.target.value },
                      })
                    }
                    placeholder="e.g. Digital Media Services"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Subtitle / Scope Headline
                  </label>
                  <input
                    type="text"
                    value={editingItem.data.subtitle || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, subtitle: e.target.value },
                      })
                    }
                    placeholder="360° SMM, SEO, PERFORMANCE ADS & LEAD GEN"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Cover Image (CloudFront CDN / Upload)
                  </label>
                  {editingItem.data.image && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, image: "" },
                        })
                      }
                      className="text-[10px] font-mono text-red-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  )}
                </div>

                {editingItem.data.image ? (
                  <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/40 p-2.5 flex items-center gap-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 relative">
                      <CachedImage
                        src={editingItem.data.image}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <span className="font-mono text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle size={12} /> Cover Attached
                      </span>
                      <p className="font-mono text-[10px] text-neutral-400 truncate max-w-full">
                        {editingItem.data.image}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <label className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[10px] font-mono font-bold cursor-pointer transition-colors active:scale-95 inline-flex items-center gap-1">
                          <UploadCloud size={11} />
                          <span>Replace Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFileUpload(f, "image");
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) handleFileUpload(f, "image");
                    }}
                    className="relative border-2 border-dashed border-white/15 hover:border-white/30 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-2 bg-[#181a24]/50"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, "image");
                      }}
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-1.5 py-2">
                        <Loader2 className="w-6 h-6 text-[#ff3b30] animate-spin" />
                        <span className="text-xs font-mono text-neutral-300">
                          {uploadProgress || "Uploading..."}
                        </span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={18} className="text-neutral-400" />
                        <p className="text-xs text-neutral-300">
                          Drag cover image here or{" "}
                          <span className="text-[#ff3b30] underline">browse</span>
                        </p>
                      </>
                    )}
                  </div>
                )}

                <input
                  type="text"
                  value={editingItem.data.image || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, image: e.target.value },
                    })
                  }
                  placeholder="Or paste CloudFront / CDN image link (https://...)"
                  className="w-full bg-[#181a24]/50 border border-white/5 rounded-lg px-2.5 py-1 text-[11px] font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-[#ff3b30]"
                />
              </div>

              {/* Comprehensive Scope & Timeline */}
              <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-[#141620] border border-white/10">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                    Service Scope & Overview Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingItem.data.details?.description || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: {
                          ...editingItem.data,
                          details: {
                            ...(editingItem.data.details || {}),
                            description: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Detailed narrative of this capability..."
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                    Execution Timeline
                  </label>
                  <input
                    type="text"
                    value={
                      editingItem.data.details?.timeline ||
                      "Ongoing Retainer / Sprint Based"
                    }
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: {
                          ...editingItem.data,
                          details: {
                            ...(editingItem.data.details || {}),
                            timeline: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="e.g. 1–2 Weeks Per Shoot or Ongoing Retainer"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>
              </div>

              {/* Deliverables & Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-[#141620] border border-white/10">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                    Key Deliverables (one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={
                      Array.isArray(editingItem.data.details?.deliverables)
                        ? editingItem.data.details.deliverables.join("\n")
                        : ""
                    }
                    onChange={(e) => {
                      const lines = e.target.value
                        .split("\n")
                        .filter((l) => l.trim().length > 0);
                      setEditingItem({
                        ...editingItem,
                        data: {
                          ...editingItem.data,
                          details: {
                            ...(editingItem.data.details || {}),
                            deliverables: lines,
                          },
                        },
                      });
                    }}
                    placeholder={"Strategic SMM\nSEO & SMO\nORM Management"}
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                    Specialized Chips / Tech (comma-separated)
                  </label>
                  <textarea
                    rows={4}
                    value={
                      Array.isArray(editingItem.data.details?.chips)
                        ? editingItem.data.details.chips.join(", ")
                        : ""
                    }
                    onChange={(e) => {
                      const chips = e.target.value
                        .split(",")
                        .map((c) => c.trim())
                        .filter(Boolean);
                      setEditingItem({
                        ...editingItem,
                        data: {
                          ...editingItem.data,
                          details: {
                            ...(editingItem.data.details || {}),
                            chips,
                          },
                        },
                      });
                    }}
                    placeholder="SMM, SEO, SMO, Meta Ads, Google Ads..."
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>
              </div>

              {/* Showcase Works Manager with Drag & Drop */}
              <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-[#141620] border border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider block">
                      Showcase Works ({editingItem.data.works?.length || 0})
                    </span>
                    <span className="font-mono text-[9px] text-neutral-400">
                      First showcase work image is displayed dynamically on website hover
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const currentWorks = editingItem.data.works || [];
                      const newWork = {
                        id: `work-${Date.now()}`,
                        title: `Showcase Item #${currentWorks.length + 1}`,
                        type: "image",
                        url: "",
                        thumbnail: "",
                        tag: "Featured Reel",
                        description: "Showcase description...",
                        metrics: "4K Master",
                      };
                      setEditingItem({
                        ...editingItem,
                        data: {
                          ...editingItem.data,
                          works: [...currentWorks, newWork],
                        },
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#ff3b30]/20 hover:bg-[#ff3b30]/30 border border-[#ff3b30]/30 text-[#ff3b30] text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <Plus size={11} /> Add Work
                  </button>
                </div>

                <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                  {(editingItem.data.works || []).map((w: any, idx: number) => {
                    const dropKey = `work-${idx}`;
                    const isDraggingHere = activeWorkDrop === dropKey;

                    return (
                      <div
                        key={w.id || idx}
                        className="p-3.5 rounded-2xl bg-[#181a24] border border-white/10 flex flex-col gap-2.5 relative"
                      >
                        {/* Work Card Header */}
                        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-white">
                              Work #{idx + 1}
                            </span>
                            {idx === 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold">
                                ★ Hover Preview
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={w.type || "image"}
                              onChange={(e) => {
                                const updatedWorks = [...editingItem.data.works];
                                updatedWorks[idx] = {
                                  ...updatedWorks[idx],
                                  type: e.target.value,
                                };
                                setEditingItem({
                                  ...editingItem,
                                  data: {
                                    ...editingItem.data,
                                    works: updatedWorks,
                                  },
                                });
                              }}
                              className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono text-neutral-200 focus:outline-none focus:border-[#ff3b30] cursor-pointer"
                            >
                              <option value="image">Image Work</option>
                              <option value="video">Video Work</option>
                              <option value="youtube">YouTube Video</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedWorks = editingItem.data.works.filter(
                                  (_: any, i: number) => i !== idx
                                );
                                setEditingItem({
                                  ...editingItem,
                                  data: {
                                    ...editingItem.data,
                                    works: updatedWorks,
                                  },
                                });
                              }}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                              title="Remove Work"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Title & Tag */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-mono text-neutral-400 uppercase">
                              Work Title
                            </label>
                            <input
                              type="text"
                              value={w.title || ""}
                              onChange={(e) => {
                                const updatedWorks = [...editingItem.data.works];
                                updatedWorks[idx] = {
                                  ...updatedWorks[idx],
                                  title: e.target.value,
                                };
                                setEditingItem({
                                  ...editingItem,
                                  data: {
                                    ...editingItem.data,
                                    works: updatedWorks,
                                  },
                                });
                              }}
                              placeholder="e.g. Apex Growth Campaign"
                              className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff3b30]"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-mono text-neutral-400 uppercase">
                              Tag / Badge
                            </label>
                            <input
                              type="text"
                              value={w.tag || ""}
                              onChange={(e) => {
                                const updatedWorks = [...editingItem.data.works];
                                updatedWorks[idx] = {
                                  ...updatedWorks[idx],
                                  tag: e.target.value,
                                };
                                setEditingItem({
                                  ...editingItem,
                                  data: {
                                    ...editingItem.data,
                                    works: updatedWorks,
                                  },
                                });
                              }}
                              placeholder="e.g. Ad Campaign Reel / Studio Shoot"
                              className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff3b30]"
                            />
                          </div>
                        </div>

                        {/* Drag & Drop Media Upload Area */}
                        {w.type === "youtube" ? (
                          <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-black/40 border border-red-500/20">
                            <label className="text-[9px] font-mono text-red-400 uppercase font-bold flex items-center gap-1">
                              <span>YouTube URL / Embed Link</span>
                            </label>
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={w.url || ""}
                                onChange={(e) => {
                                  const urlVal = e.target.value;
                                  let ytId = "";
                                  const match = urlVal.match(
                                    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
                                  );
                                  if (match && match[1]) {
                                    ytId = match[1];
                                  }
                                  const updatedWorks = [...editingItem.data.works];
                                  updatedWorks[idx] = {
                                    ...updatedWorks[idx],
                                    url: urlVal,
                                    youtubeId: ytId || updatedWorks[idx].youtubeId,
                                    thumbnail: ytId
                                      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                                      : updatedWorks[idx].thumbnail || "",
                                  };
                                  setEditingItem({
                                    ...editingItem,
                                    data: {
                                      ...editingItem.data,
                                      works: updatedWorks,
                                    },
                                  });
                                }}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="flex-1 bg-[#181a24] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                              />
                            </div>
                            {w.thumbnail && (
                              <div className="flex items-center gap-2.5 pt-1">
                                <img
                                  src={w.thumbnail}
                                  alt="YT Preview"
                                  className="w-20 h-12 object-cover rounded-lg border border-white/10"
                                />
                                <span className="text-[10px] font-mono text-neutral-400">
                                  Thumbnail synced from YouTube ({w.youtubeId || "Auto"})
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[9px] font-mono text-neutral-400 uppercase font-semibold">
                                Work Media (Drag & Drop Image or Video)
                              </label>
                              {w.url && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedWorks = [...editingItem.data.works];
                                    updatedWorks[idx] = {
                                      ...updatedWorks[idx],
                                      url: "",
                                      thumbnail: "",
                                    };
                                    setEditingItem({
                                      ...editingItem,
                                      data: {
                                        ...editingItem.data,
                                        works: updatedWorks,
                                      },
                                    });
                                  }}
                                  className="text-[9px] font-mono text-red-400 hover:underline cursor-pointer flex items-center gap-0.5"
                                >
                                  <Trash2 size={10} /> Clear Media
                                </button>
                              )}
                            </div>

                            {w.url ? (
                              <div className="rounded-xl overflow-hidden border border-white/15 bg-black/40 p-2 flex items-center gap-2.5">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10 relative">
                                  {w.type === "video" ||
                                  w.url.endsWith(".mp4") ||
                                  w.url.endsWith(".webm") ? (
                                    <video
                                      src={w.url}
                                      className="w-full h-full object-cover"
                                      muted
                                      autoPlay
                                      loop
                                      playsInline
                                    />
                                  ) : (
                                    <CachedImage
                                      src={w.thumbnail || w.url}
                                      alt="Work Preview"
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <div className="flex flex-col gap-1 min-w-0 flex-1 text-left">
                                  <span className="font-mono text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                    <CheckCircle size={11} /> File Uploaded & Linked
                                  </span>
                                  <p className="font-mono text-[9px] text-neutral-400 truncate">
                                    {w.url}
                                  </p>
                                  <label className="w-fit px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[9px] font-mono font-bold cursor-pointer transition-colors inline-flex items-center gap-1">
                                    <UploadCloud size={10} />
                                    <span>Replace</span>
                                    <input
                                      type="file"
                                      accept={
                                        w.type === "video"
                                          ? "video/*"
                                          : "image/*,video/*"
                                      }
                                      className="hidden"
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleFileUpload(f, "workUrl", idx);
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActiveWorkDrop(dropKey);
                                }}
                                onDragLeave={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (activeWorkDrop === dropKey)
                                    setActiveWorkDrop(null);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActiveWorkDrop(null);
                                  const f = e.dataTransfer.files?.[0];
                                  if (f) handleFileUpload(f, "workUrl", idx);
                                }}
                                className={`relative border-2 border-dashed rounded-xl p-3 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all ${
                                  isDraggingHere
                                    ? "border-[#ff3b30] bg-[#ff3b30]/15 scale-[1.01]"
                                    : "border-white/15 hover:border-white/30 bg-black/30 hover:bg-black/50"
                                }`}
                              >
                                <input
                                  type="file"
                                  accept={
                                    w.type === "video"
                                      ? "video/*"
                                      : "image/*,video/*"
                                  }
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFileUpload(f, "workUrl", idx);
                                  }}
                                />
                                {isUploading ? (
                                  <div className="flex items-center gap-1.5 py-1">
                                    <Loader2 className="w-4 h-4 text-[#ff3b30] animate-spin" />
                                    <span className="text-[10px] font-mono text-neutral-300">
                                      {uploadProgress || "Uploading..."}
                                    </span>
                                  </div>
                                ) : (
                                  <>
                                    <UploadCloud
                                      size={16}
                                      className={
                                        isDraggingHere
                                          ? "text-[#ff3b30]"
                                          : "text-neutral-400"
                                      }
                                    />
                                    <p className="text-[10px] text-neutral-300">
                                      Drag & drop image/video here, or{" "}
                                      <span className="text-[#ff3b30] underline font-semibold">
                                        browse
                                      </span>
                                    </p>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Fallback URL input */}
                            <input
                              type="text"
                              value={w.url || ""}
                              onChange={(e) => {
                                const updatedWorks = [...editingItem.data.works];
                                updatedWorks[idx] = {
                                  ...updatedWorks[idx],
                                  url: e.target.value,
                                  thumbnail:
                                    updatedWorks[idx].thumbnail || e.target.value,
                                };
                                setEditingItem({
                                  ...editingItem,
                                  data: {
                                    ...editingItem.data,
                                    works: updatedWorks,
                                  },
                                });
                              }}
                              placeholder="Or paste CloudFront / CDN image/video URL"
                              className="bg-black/30 border border-white/5 rounded-lg px-2 py-1 text-[10px] font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-[#ff3b30]"
                            />
                          </div>
                        )}

                        {/* Metrics & Description */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-mono text-neutral-400 uppercase">
                              Metrics / Stats
                            </label>
                            <input
                              type="text"
                              value={w.metrics || ""}
                              onChange={(e) => {
                                const updatedWorks = [...editingItem.data.works];
                                updatedWorks[idx] = {
                                  ...updatedWorks[idx],
                                  metrics: e.target.value,
                                };
                                setEditingItem({
                                  ...editingItem,
                                  data: {
                                    ...editingItem.data,
                                    works: updatedWorks,
                                  },
                                });
                              }}
                              placeholder="e.g. +280% Lead Volume • 4K"
                              className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff3b30]"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-mono text-neutral-400 uppercase">
                              Short Description
                            </label>
                            <input
                              type="text"
                              value={w.description || ""}
                              onChange={(e) => {
                                const updatedWorks = [...editingItem.data.works];
                                updatedWorks[idx] = {
                                  ...updatedWorks[idx],
                                  description: e.target.value,
                                };
                                setEditingItem({
                                  ...editingItem,
                                  data: {
                                    ...editingItem.data,
                                    works: updatedWorks,
                                  },
                                });
                              }}
                              placeholder="e.g. Multi-channel lead generation campaign..."
                              className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff3b30]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {(!editingItem.data.works ||
                    editingItem.data.works.length === 0) && (
                    <div className="py-4 text-center text-[11px] font-mono text-neutral-500 bg-black/20 rounded-xl border border-white/5">
                      No showcase works added yet. Click "+ Add Work" above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TEAM MEMBER SPECIFIC FIELDS
             ========================================================================= */}
          {editingItem.type === "team" && (
            <div className="flex flex-col gap-3.5 text-left">
              {/* Name and Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.data.name || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, name: e.target.value },
                      })
                    }
                    placeholder="e.g. SARAH CONNER"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Role / Designation
                  </label>
                  <input
                    type="text"
                    value={editingItem.data.role || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, role: e.target.value },
                      })
                    }
                    placeholder="e.g. CREATIVE DIRECTOR"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Column and Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Column Alignment (1 to 5) <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={editingItem.data.column || 1}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: {
                          ...editingItem.data,
                          column: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-white cursor-pointer"
                  >
                    <option value="1">Column 1 (Left - Lower Offset)</option>
                    <option value="2">Column 2 (Left-Center - Elevated)</option>
                    <option value="3">Column 3 (Center - Focal Portrait)</option>
                    <option value="4">Column 4 (Right-Center - Elevated)</option>
                    <option value="5">Column 5 (Right - Lower Offset)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Display Order (1, 2, 3...)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editingItem.data.order ?? 1}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: {
                          ...editingItem.data,
                          order: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Portrait Image Drag & Drop Upload */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Portrait Photo (Drag & Drop / CDN)
                  </label>
                  {editingItem.data.image && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, image: "" },
                        })
                      }
                      className="text-[10px] font-mono text-red-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  )}
                </div>

                {editingItem.data.image ? (
                  <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/40 p-2.5 flex items-center gap-3">
                    <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 relative">
                      <CachedImage
                        src={editingItem.data.image}
                        alt="Portrait Preview"
                        className="w-full h-full object-cover grayscale contrast-125 brightness-95"
                      />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <span className="font-mono text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle size={12} /> Photo Attached
                      </span>
                      <p className="font-mono text-[10px] text-neutral-400 truncate max-w-full">
                        {editingItem.data.image}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <label className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[10px] font-mono font-bold cursor-pointer transition-colors active:scale-95 inline-flex items-center gap-1">
                          <UploadCloud size={11} />
                          <span>Replace Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFileUpload(f, "image");
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) handleFileUpload(f, "image");
                    }}
                    className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                      dragActive
                        ? "border-white bg-white/10 scale-[1.01]"
                        : "border-white/20 hover:border-white/40 bg-[#181a24]/60 hover:bg-[#181a24]"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, "image");
                      }}
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-1.5 py-2">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                        <span className="text-xs font-mono text-neutral-300">
                          {uploadProgress || "Uploading portrait..."}
                        </span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={20} className="text-neutral-400" />
                        <p className="text-xs text-neutral-300">
                          Drag portrait photo here or{" "}
                          <span className="text-white underline">browse</span>
                        </p>
                        <p className="text-[10px] font-mono text-neutral-500">
                          Aspect ratio ~ 3:4 portrait recommended
                        </p>
                      </>
                    )}
                  </div>
                )}

                <input
                  type="text"
                  value={editingItem.data.image || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, image: e.target.value },
                    })
                  }
                  placeholder="Or paste direct image URL (https://...)"
                  className="w-full bg-[#181a24]/50 border border-white/5 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-white"
                />
              </div>

              {/* Bio & Active Status */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                  Biography / Short Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={editingItem.data.bio || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, bio: e.target.value },
                    })
                  }
                  placeholder="Brief background or creative philosophy..."
                  className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-white resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="team-active-toggle"
                  checked={editingItem.data.isActive !== false}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: {
                        ...editingItem.data,
                        isActive: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded bg-[#181a24] border-white/20 text-white focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="team-active-toggle"
                  className="text-xs font-mono text-neutral-300 cursor-pointer"
                >
                  Show on public website (Active)
                </label>
              </div>
            </div>
          )}

          {/* =========================================================================
              FOUNDER PROFILE SPECIFIC FIELDS
             ========================================================================= */}
          {editingItem.type === "founder" && (
            <div className="flex flex-col gap-4 text-left">
              <div className="p-3.5 rounded-2xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ff3b30]/20 text-[#ff3b30] flex items-center justify-center shrink-0">
                  <Crown size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Founder Profile Live Configuration
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Changes here are immediately reflected across the website in the Founder Dossier modal &amp; mobile showcases.
                  </p>
                </div>
              </div>

              {/* Name and Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Founder Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.data.name || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, name: e.target.value },
                      })
                    }
                    placeholder="SHUBHAM SINGH"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Role &amp; Vision Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.data.role || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, role: e.target.value },
                      })
                    }
                    placeholder="CREATIVE DIRECTOR & VISIONARY"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>
              </div>

              {/* Badge & Subtitle & Location Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Pill Badge Text
                  </label>
                  <input
                    type="text"
                    value={editingItem.data.badge || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, badge: e.target.value },
                      })
                    }
                    placeholder="MEET THE FOUNDER"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Header Subtitle
                  </label>
                  <input
                    type="text"
                    value={editingItem.data.subtitle || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, subtitle: e.target.value },
                      })
                    }
                    placeholder="LEADERSHIP & VISION"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Location / City Tag
                  </label>
                  <input
                    type="text"
                    value={editingItem.data.cityTag || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, cityTag: e.target.value },
                      })
                    }
                    placeholder="VARANASI × GLOBAL"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>
              </div>

              {/* Founder Portrait Photo Upload / URL */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Founder Portrait Photo
                  </label>
                  {editingItem.data.image && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, image: "" },
                        })
                      }
                      className="text-[10px] font-mono text-red-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Reset to Default Photo
                    </button>
                  )}
                </div>

                {editingItem.data.image ? (
                  <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/40 p-2.5 flex items-center gap-3">
                    <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 relative">
                      <img
                        src={editingItem.data.image}
                        alt="Founder Preview"
                        className="w-full h-full object-cover"
                        style={{ objectPosition: "48% 36%" }}
                      />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <span className="font-mono text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle size={12} /> Custom Photo Active
                      </span>
                      <p className="font-mono text-[10px] text-neutral-400 truncate max-w-full">
                        {editingItem.data.image}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <label className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[10px] font-mono font-bold cursor-pointer transition-colors inline-flex items-center gap-1">
                          <UploadCloud size={11} />
                          <span>Replace Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFileUpload(f, "image");
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) handleFileUpload(f, "image");
                    }}
                    className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all ${
                      dragActive
                        ? "border-[#ff3b30] bg-[#ff3b30]/10"
                        : "border-white/15 hover:border-white/30 bg-black/20"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, "image");
                      }}
                    />
                    {isUploading ? (
                      <div className="flex items-center gap-2 py-2">
                        <Loader2 className="w-5 h-5 text-[#ff3b30] animate-spin" />
                        <span className="text-xs font-mono text-neutral-300">
                          {uploadProgress || "Uploading portrait..."}
                        </span>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={20} className="text-[#ff3b30]" />
                        <p className="text-xs text-neutral-300">
                          Drag portrait photo here or{" "}
                          <span className="text-[#ff3b30] underline">browse</span>
                        </p>
                        <p className="text-[10px] font-mono text-neutral-500">
                          Leave empty to use high-res default studio portrait (Picture12.webp)
                        </p>
                      </>
                    )}
                  </div>
                )}

                <input
                  type="text"
                  value={editingItem.data.image || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, image: e.target.value },
                    })
                  }
                  placeholder="Or paste direct image URL (https://...)"
                  className="w-full bg-[#181a24]/50 border border-white/5 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-[#ff3b30]"
                />
              </div>

              {/* Primary & Secondary Bio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Primary Bio Paragraph
                  </label>
                  <textarea
                    rows={4}
                    value={editingItem.data.bio || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, bio: e.target.value },
                      })
                    }
                    placeholder="Born in India and raised in the city of artists, Varanasi..."
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff3b30] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Secondary Bio Paragraph
                  </label>
                  <textarea
                    rows={4}
                    value={editingItem.data.bioSecondary || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, bioSecondary: e.target.value },
                      })
                    }
                    placeholder="As an accomplished digital content creator and 3D visionary..."
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff3b30] resize-none"
                  />
                </div>
              </div>

              {/* Credo / Quote */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                  Credo / Highlight Quote
                </label>
                <textarea
                  rows={2}
                  value={editingItem.data.quote || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, quote: e.target.value },
                    })
                  }
                  placeholder="His unique style, artistic training, and profound appreciation for light..."
                  className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white italic focus:outline-none focus:border-[#ff3b30] resize-none"
                />
              </div>

              {/* Specialties Tags (comma separated) */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                  Specialties &amp; Disciplines (comma-separated tags)
                </label>
                <input
                  type="text"
                  value={
                    Array.isArray(editingItem.data.specialties)
                      ? editingItem.data.specialties.join(", ")
                      : editingItem.data.specialties || ""
                  }
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: {
                        ...editingItem.data,
                        specialties: e.target.value
                          .split(",")
                          .map((s: string) => s.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                  placeholder="Brand Strategy, CGI Direction, Creative Automation..."
                  className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={editingItem.data.linkedinUrl || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, linkedinUrl: e.target.value },
                      })
                    }
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                    Instagram Handle / URL
                  </label>
                  <input
                    type="url"
                    value={editingItem.data.instagramUrl || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, instagramUrl: e.target.value },
                      })
                    }
                    placeholder="https://instagram.com/..."
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ff3b30]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              3D SHOWCASE SPECIFIC FIELDS
             ========================================================================= */}
          {editingItem.type === "threed" && (
            <div className="flex flex-col gap-4 text-left py-2">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <FileVideo size={18} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">
                    Video-Only 3D Showcase Reel
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Upload or paste high-resolution 3D CGI video render. No text or inquiry data required.
                  </p>
                </div>
              </div>

              {/* 3D Showcase Video / Media Drag & Drop Upload */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[10px] sm:text-[11px] text-purple-400 uppercase font-bold tracking-wider">
                    3D Video File (Drag & Drop or Select)
                  </label>
                  {editingItem.data.videoUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, videoUrl: "" },
                        })
                      }
                      className="text-[10px] font-mono text-red-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  )}
                </div>

                {editingItem.data.videoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-black/60 p-3 flex flex-col gap-3">
                    {/* Video Player Preview */}
                    <div className="w-full max-h-56 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-white/10 relative">
                      <video
                        src={editingItem.data.videoUrl}
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full max-h-56 object-contain"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-mono text-[11px] text-purple-300 font-semibold flex items-center gap-1">
                          <CheckCircle size={12} className="text-purple-400" /> 3D Video Attached & Ready
                        </span>
                        <p className="font-mono text-[10px] text-neutral-400 truncate">
                          {editingItem.data.videoUrl}
                        </p>
                      </div>

                      <label className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold cursor-pointer transition-colors shrink-0 active:scale-95 inline-flex items-center gap-1">
                        <UploadCloud size={13} />
                        <span>Replace Video</span>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(f, "videoUrl");
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) handleFileUpload(f, "videoUrl");
                    }}
                    className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                      dragActive
                        ? "border-purple-500 bg-purple-500/15 scale-[1.01]"
                        : "border-purple-500/30 hover:border-purple-500/60 bg-[#181a24]/60 hover:bg-[#181a24]"
                    }`}
                  >
                    <input
                      type="file"
                      accept="video/*"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, "videoUrl");
                      }}
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2 py-4">
                        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                        <span className="text-xs font-mono text-purple-300 font-semibold">
                          {uploadProgress || "Uploading 3D video reel..."}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                          <FileVideo size={28} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-semibold text-white">
                            Drag & drop 3D video reel (.mp4, .webm, .mov) here, or{" "}
                            <span className="text-purple-400 underline">browse</span>
                          </p>
                          <p className="text-[11px] font-mono text-neutral-400">
                            Supports high-res MP4, WebM, MOV renders (Up to 50MB)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Or Video URL input */}
                <div className="pt-1">
                  <label className="font-mono text-[10px] text-neutral-400 uppercase mb-1 block">
                    Or Video Stream / Cloud URL
                  </label>
                  <input
                    type="text"
                    value={editingItem.data.videoUrl || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, videoUrl: e.target.value },
                      })
                    }
                    placeholder="https://cdn.example.com/3d-render.mp4"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              BLOGS & EDITORIAL ARTICLE SPECIFIC FIELDS
             ========================================================================= */}
          {editingItem.type === "blogs" && (
            <div className="flex flex-col gap-3.5">
              {/* Article Title */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] sm:text-[11px] text-neutral-400 uppercase font-semibold">
                  Article Headline / Title <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.data.title || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, title: e.target.value },
                    })
                  }
                  placeholder="e.g. Empower Your Brand's Digital Journey with Bharat DigiGuru"
                  className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 font-semibold"
                />
              </div>

              {/* Category, Number, Read Time & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                    Editorial Category
                  </label>
                  <input
                    type="text"
                    value={editingItem.data.category || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, category: e.target.value },
                      })
                    }
                    placeholder="e.g. Digital Acceleration"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                    Index Number
                  </label>
                  <input
                    type="text"
                    value={editingItem.data.number || "(01)"}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, number: e.target.value },
                      })
                    }
                    placeholder="(01)"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={editingItem.data.readTime || "5 MIN READ"}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, readTime: e.target.value },
                      })
                    }
                    placeholder="6 MIN READ"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                    Publication Date
                  </label>
                  <input
                    type="text"
                    value={editingItem.data.date || "AUG 2026"}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, date: e.target.value },
                      })
                    }
                    placeholder="AUG 2026"
                    className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center p-3 rounded-xl bg-[#141620] border border-white/10 font-mono text-xs mt-auto">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={editingItem.data.isPublished !== false}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, isPublished: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                    />
                    <span>Published & Visible to Public</span>
                  </label>
                </div>
              </div>

              {/* Summary / Description */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-neutral-400 uppercase font-semibold">
                  Short Summary / Card Description <span className="text-cyan-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.data.description || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, description: e.target.value },
                    })
                  }
                  placeholder="Brief excerpt shown on article previews and cards..."
                  className="w-full bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              {/* Article Media & Banner Gallery (Multi-Image Support) */}
              <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#141620] border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <UploadCloud size={15} />
                    <label className="font-mono text-[10px] sm:text-[11px] text-white uppercase font-bold">
                      Article Media Assets &amp; Banners (
                      {Array.isArray(editingItem.data.images)
                        ? editingItem.data.images.length
                        : editingItem.data.image
                        ? 1
                        : 0}
                      )
                    </label>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-400 hidden sm:inline">
                    Select multiple images · Set primary banner · Insert into editorial story
                  </span>
                </div>

                {/* Multi-Image Gallery Grid if images exist */}
                {(() => {
                  const allImages: string[] =
                    Array.isArray(editingItem.data.images) &&
                    editingItem.data.images.length > 0
                      ? editingItem.data.images
                      : editingItem.data.image
                      ? [editingItem.data.image]
                      : [];

                  if (allImages.length === 0) return null;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                      {allImages.map((imgUrl: string, idx: number) => {
                        const isPrimary =
                          editingItem.data.image === imgUrl ||
                          (!editingItem.data.image && idx === 0);

                        return (
                          <div
                            key={idx}
                            className={`relative rounded-xl overflow-hidden border p-2 flex flex-col gap-2 bg-black/60 transition-all ${
                              isPrimary
                                ? "border-cyan-500 shadow-md shadow-cyan-950/40"
                                : "border-white/10 hover:border-white/20"
                            }`}
                          >
                            <div className="relative w-full h-24 rounded-lg overflow-hidden bg-black/80 flex items-center justify-center">
                              <CachedImage
                                src={imgUrl}
                                alt={`Media ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {isPrimary && (
                                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-cyan-600 text-white font-mono text-[9px] font-bold shadow">
                                  ★ PRIMARY BANNER
                                </span>
                              )}
                            </div>

                            <p className="font-mono text-[9px] text-neutral-400 truncate">
                              {imgUrl}
                            </p>

                            <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/5">
                              {!isPrimary && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setEditingItem({
                                      ...editingItem,
                                      data: {
                                        ...editingItem.data,
                                        image: imgUrl,
                                      },
                                    });
                                  }}
                                  className="px-2 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold cursor-pointer transition-colors"
                                >
                                  Set As Banner
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const currentContent =
                                    typeof editingItem.data.content === "string"
                                      ? editingItem.data.content
                                      : "";
                                  const imgHtml = `<p><img src="${imgUrl}" alt="Article Visual" style="width: 100%; margin: 1.5rem auto; display: block;" /></p>`;
                                  setEditingItem({
                                    ...editingItem,
                                    data: {
                                      ...editingItem.data,
                                      content: currentContent + imgHtml,
                                    },
                                  });
                                  showNotification(
                                    "Image inserted into article body!"
                                  );
                                }}
                                className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-neutral-300 font-mono text-[9px] font-bold cursor-pointer transition-colors"
                                title="Append this image into the editorial content"
                              >
                                Insert in Story
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const updatedImages = allImages.filter(
                                    (_, i) => i !== idx
                                  );
                                  const updatedPrimary = isPrimary
                                    ? updatedImages[0] || ""
                                    : editingItem.data.image;
                                  setEditingItem({
                                    ...editingItem,
                                    data: {
                                      ...editingItem.data,
                                      image: updatedPrimary,
                                      images: updatedImages,
                                    },
                                  });
                                }}
                                className="p-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer transition-colors ml-auto"
                                title="Remove this image asset"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Multi-Image Drag & Drop Upload Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleMultipleBlogMediaUpload(e.dataTransfer.files);
                    }
                  }}
                  className="relative border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-2 bg-[#181a24]/50"
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleMultipleBlogMediaUpload(e.target.files);
                      }
                    }}
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-1.5 py-2">
                      <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                      <span className="text-xs font-mono text-cyan-300">
                        {uploadProgress || "Uploading images to Cloud..."}
                      </span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={20} className="text-cyan-400" />
                      <p className="text-xs text-neutral-300">
                        Drag one or{" "}
                        <span className="text-cyan-400 font-bold underline">
                          multiple images
                        </span>{" "}
                        here or click to browse
                      </p>
                      <span className="font-mono text-[10px] text-neutral-500">
                        Supports multi-selection (PNG, JPG, JPEG, WebP)
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingItem.data.image || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const currentImages = Array.isArray(editingItem.data.images)
                        ? editingItem.data.images
                        : [];
                      setEditingItem({
                        ...editingItem,
                        data: {
                          ...editingItem.data,
                          image: val,
                          images:
                            val && !currentImages.includes(val)
                              ? [val, ...currentImages]
                              : currentImages,
                        },
                      });
                    }}
                    placeholder="Or paste direct CloudFront / CDN image URL (https://...)"
                    className="w-full bg-[#181a24]/50 border border-white/5 rounded-lg px-2.5 py-1 text-[11px] font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Rich Text Editor */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <FileText size={15} />
                    <h4 className="font-['Syne',sans-serif] font-bold text-xs sm:text-sm text-white">
                      Article Editorial Content (Rich Text)
                    </h4>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-400 hidden sm:inline">
                    Supports Headings (H2-H4), Lists, Formats, Quotes, Code &amp; Links
                  </span>
                </div>

                <RichTextEditor
                  value={
                    typeof editingItem.data.content === "string"
                      ? editingItem.data.content
                      : Array.isArray(editingItem.data.content)
                      ? editingItem.data.content
                          .map((p: any) => `<p>${p}</p>`)
                          .join("")
                      : ""
                  }
                  onChange={(html) =>
                    setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, content: html },
                    })
                  }
                  onUploadImage={async (file: File) => {
                    const res: any = await adminService.uploadMedia(file);
                    return res?.url || res?.data?.url || "";
                  }}
                  placeholder="Write your article story here... Highlight text to add links or formatting."
                />
              </div>

              {/* Key Highlights / Bullets */}
              <div className="flex flex-col gap-2.5 p-3.5 rounded-2xl bg-[#141620] border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <Sparkles size={15} />
                    <h4 className="font-['Syne',sans-serif] font-bold text-xs sm:text-sm text-white">
                      Key Bullets & Strategic Highlights (
                      {(editingItem.data.bullets || []).length})
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const currentBullets = Array.isArray(editingItem.data.bullets)
                        ? editingItem.data.bullets
                        : [];
                      setEditingItem({
                        ...editingItem,
                        data: {
                          ...editingItem.data,
                          bullets: [...currentBullets, ""],
                        },
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                  >
                    <Plus size={11} />
                    <span>Add Bullet</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {(editingItem.data.bullets || []).map(
                    (bullet: string, bIdx: number) => (
                      <div key={bIdx} className="flex items-center gap-2">
                        <span className="font-mono text-xs text-cyan-400 font-bold shrink-0">
                          •
                        </span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => {
                            const updated = [
                              ...(editingItem.data.bullets || []),
                            ];
                            updated[bIdx] = e.target.value;
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, bullets: updated },
                            });
                          }}
                          placeholder="e.g. Elevate the brand's social media presence with expert SMM Strategies"
                          className="flex-1 bg-[#181a24] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [
                              ...(editingItem.data.bullets || []),
                            ];
                            updated.splice(bIdx, 1);
                            setEditingItem({
                              ...editingItem,
                              data: { ...editingItem.data, bullets: updated },
                            });
                          }}
                          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 mt-2 pt-2.5 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer active:scale-95 ${
                editingItem.type === "blogs"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                  : editingItem.type === "threed"
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : editingItem.type === "team"
                  ? "bg-white hover:bg-neutral-200 !text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  : "bg-[#ff3b30] hover:bg-[#b91c1c] text-white"
              }`}
            >
              {editingItem.type === "blogs"
                ? editingItem.isNew
                  ? "PUBLISH ARTICLE"
                  : "UPDATE ARTICLE"
                : editingItem.type === "threed"
                ? "PUBLISH 3D VIDEO"
                : editingItem.type === "services"
                ? editingItem.isNew
                  ? "PUBLISH SERVICE"
                  : "UPDATE SERVICE"
                : editingItem.type === "team"
                ? editingItem.isNew
                  ? "PUBLISH MEMBER"
                  : "UPDATE MEMBER"
                : "SAVE RECORD"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
