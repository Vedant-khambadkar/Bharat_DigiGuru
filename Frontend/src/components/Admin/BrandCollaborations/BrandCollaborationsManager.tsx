import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Sparkles,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  MoveUp,
  MoveDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  X,
  FileCheck,
} from "lucide-react";
import { adminService } from "../../../services/service/adminService";
import { onSocketEvent } from "../../../utils/socket";
import type { BrandCollaboration } from "../../../types/brand";
import { BrandCollaborationFormModal } from "./BrandCollaborationFormModal";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";

export const BrandCollaborationsManager: React.FC = () => {
  const [brands, setBrands] = useState<BrandCollaboration[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Notification state
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingBrand, setEditingBrand] = useState<BrandCollaboration | null>(null);

  // Delete Modal state
  const [brandToDelete, setBrandToDelete] = useState<BrandCollaboration | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Lightbox Logo Preview state
  const [previewingLogo, setPreviewingLogo] = useState<{
    url: string;
    name: string;
    format?: string;
    size?: number;
  } | null>(null);

  // Reorder loading state
  const [isReordering, setIsReordering] = useState<boolean>(false);

  // Auto-dismiss notifications after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch brands
  const fetchBrands = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await adminService.getBrandCollaborations(undefined, true);
      const items: BrandCollaboration[] = Array.isArray(res)
        ? res
        : res?.items || res?.data || [];
      // Sort by order ascending
      items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setBrands(items);
    } catch (err: any) {
      console.error("Error fetching brand collaborations:", err);
      setNotification({
        type: "error",
        message: err.message || "Failed to load brand collaborations.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Socket.IO real-time synchronization
  useEffect(() => {
    const unsubCreated = onSocketEvent("brand:created", () => {
      fetchBrands(true);
    });
    const unsubUpdated = onSocketEvent("brand:updated", () => {
      fetchBrands(true);
    });
    const unsubDeleted = onSocketEvent("brand:deleted", () => {
      fetchBrands(true);
    });
    const unsubReordered = onSocketEvent("brands:reordered", () => {
      fetchBrands(true);
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
      unsubReordered();
    };
  }, [fetchBrands]);

  // Filtered & Searched Brands
  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      // Status filter
      if (statusFilter === "ACTIVE" && !brand.isActive) return false;
      if (statusFilter === "INACTIVE" && brand.isActive) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = brand.name?.toLowerCase().includes(q);
        const matchesAlt = brand.altText?.toLowerCase().includes(q);
        const matchesFormat = brand.originalFormat?.toLowerCase().includes(q);
        if (!matchesName && !matchesAlt && !matchesFormat) return false;
      }

      return true;
    });
  }, [brands, statusFilter, searchQuery]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingBrand(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (brand: BrandCollaboration) => {
    setEditingBrand(brand);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: FormData) => {
    if (editingBrand) {
      await adminService.updateBrandCollaboration(editingBrand.id, formData);
      setNotification({
        type: "success",
        message: `Brand "${editingBrand.name}" updated successfully with WebP optimization.`,
      });
    } else {
      await adminService.createBrandCollaboration(formData);
      setNotification({
        type: "success",
        message: "Brand collaboration added successfully with automatic WebP conversion.",
      });
    }
    await fetchBrands(true);
  };

  const handleToggleStatus = async (brand: BrandCollaboration) => {
    try {
      const nextStatus = !brand.isActive;
      // Optimistic update
      setBrands((prev) =>
        prev.map((b) => (b.id === brand.id ? { ...b, isActive: nextStatus } : b))
      );

      await adminService.updateBrandCollaborationStatus(brand.id, nextStatus);
      setNotification({
        type: "success",
        message: `"${brand.name}" is now ${nextStatus ? "active" : "inactive"} on the public website.`,
      });
    } catch (err: any) {
      // Revert on error
      fetchBrands(true);
      setNotification({
        type: "error",
        message: err.message || "Failed to update visibility status.",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return;
    setIsDeleting(true);
    try {
      await adminService.deleteBrandCollaboration(brandToDelete.id);
      setNotification({
        type: "success",
        message: `Brand "${brandToDelete.name}" deleted and asset cleaned up.`,
      });
      setBrandToDelete(null);
      await fetchBrands(true);
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Failed to delete brand collaboration.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Move brand up or down in sequence
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    if (isReordering) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredBrands.length) return;

    setIsReordering(true);
    const newItems = [...brands];

    // Find original indexes in full brands array
    const currentBrand = filteredBrands[index];
    const targetBrand = filteredBrands[targetIndex];

    const idxA = newItems.findIndex((b) => b.id === currentBrand.id);
    const idxB = newItems.findIndex((b) => b.id === targetBrand.id);

    if (idxA === -1 || idxB === -1) {
      setIsReordering(false);
      return;
    }

    // Swap positions
    const temp = newItems[idxA];
    newItems[idxA] = newItems[idxB];
    newItems[idxB] = temp;

    // Re-assign normalized sequential order numbers
    const payload = newItems.map((item, idx) => ({
      id: item.id,
      order: idx + 1,
    }));

    // Optimistic state
    setBrands(
      newItems.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }))
    );

    try {
      await adminService.reorderBrandCollaborations(payload);
      setNotification({
        type: "success",
        message: "Brand sequence updated successfully.",
      });
    } catch (err: any) {
      console.error("Reorder failed:", err);
      fetchBrands(true);
      setNotification({
        type: "error",
        message: "Failed to persist brand display order.",
      });
    } finally {
      setIsReordering(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return "—";
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-md shadow-2xl transition-all ${
            notification.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/15 border-red-500/30 text-red-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-red-400 shrink-0" />
            )}
            <span className="font-mono text-xs">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#141824] via-[#11131b] to-[#141824] backdrop-blur-md p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none" />

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-['Syne',sans-serif] font-bold text-lg sm:text-2xl text-white">
                Brand Collaborations
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-neutral-300 border border-white/15">
                {brands.length} Total
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {brands.filter((b) => b.isActive).length} Live
              </span>
            </div>
            <p className="font-mono text-xs text-neutral-400 mt-0.5">
              Automatic WebP compression &amp; seamless continuous horizontal slider display
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 self-end md:self-auto">
          <button
            type="button"
            onClick={() => fetchBrands(true)}
            disabled={isRefreshing || isLoading}
            className="p-2.5 text-neutral-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh brands list"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Brand</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#11131b]/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by brand name or alt text..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 font-sans text-xs focus:outline-none focus:border-red-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === filter
                  ? "bg-white/15 text-white border border-white/20 shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {filter === "ALL"
                ? `All (${brands.length})`
                : filter === "ACTIVE"
                ? `Active (${brands.filter((b) => b.isActive).length})`
                : `Inactive (${brands.filter((b) => !b.isActive).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content Table / Cards */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 bg-[#11131b]/50 rounded-2xl border border-white/10">
          <Loader2 size={32} className="animate-spin text-red-500" />
          <p className="font-mono text-xs text-neutral-400">Loading brand collaborations...</p>
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="p-16 flex flex-col items-center justify-center gap-4 bg-[#11131b]/40 rounded-2xl border border-white/10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
            <ImageIcon size={32} />
          </div>
          <div>
            <h3 className="font-['Syne',sans-serif] font-bold text-base text-white">
              {searchQuery || statusFilter !== "ALL"
                ? "No matching brand collaborations found"
                : "No brand collaborations yet"}
            </h3>
            <p className="font-mono text-xs text-neutral-400 max-w-sm mt-1">
              {searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your search query or status filter."
                : "Upload your partner logos. They will be automatically converted to optimized WebP format."}
            </p>
          </div>
          {(!searchQuery && statusFilter === "ALL") && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-5 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center gap-2 cursor-pointer mt-2"
            >
              <Plus size={14} />
              <span>Add Your First Brand</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#11131b]/70 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden shadow-xl">
          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-14 text-center">Order</th>
                  <th className="py-3.5 px-4 w-28">Logo</th>
                  <th className="py-3.5 px-4">Brand Name</th>
                  <th className="py-3.5 px-4">Formats &amp; Size</th>
                  <th className="py-3.5 px-4 w-32 text-center">Status</th>
                  <th className="py-3.5 px-4 w-28 text-center">Reorder</th>
                  <th className="py-3.5 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-sm">
                {filteredBrands.map((brand, index) => (
                  <tr
                    key={brand.id || index}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Order Number */}
                    <td className="py-4 px-4 text-center font-mono font-bold text-xs text-neutral-400">
                      <span className="inline-block w-7 h-7 leading-7 rounded-lg bg-white/5 border border-white/10 text-white">
                        {brand.order ?? index + 1}
                      </span>
                    </td>

                    {/* Logo Thumbnail */}
                    <td className="py-4 px-4">
                      <div
                        onClick={() =>
                          setPreviewingLogo({
                            url: brand.logoUrl,
                            name: brand.name,
                            format: brand.format || "webp",
                            size: brand.size,
                          })
                        }
                        className="w-20 h-14 rounded-xl bg-[#181c28] border border-white/10 p-2 flex items-center justify-center shrink-0 cursor-pointer hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all group/logo relative overflow-hidden"
                        title="Click to preview logo"
                      >
                        <img
                          src={brand.logoUrl}
                          alt={brand.altText || brand.name}
                          className="max-w-full max-h-full object-contain filter drop-shadow transition-transform group-hover/logo:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Eye size={14} />
                        </div>
                      </div>
                    </td>

                    {/* Brand Name & Alt */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-['Syne',sans-serif] font-bold text-white text-base">
                          {brand.name}
                        </span>
                        {brand.altText && (
                          <span className="font-mono text-xs text-neutral-400 truncate max-w-xs" title={brand.altText}>
                            Alt: &ldquo;{brand.altText}&rdquo;
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Format & Size Information */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          {brand.originalFormat && (
                            <span className="px-1.5 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10 text-[10px] uppercase">
                              {brand.originalFormat}
                            </span>
                          )}
                          <span className="text-neutral-500">&rarr;</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase flex items-center gap-1">
                            <FileCheck size={10} />
                            WEBP
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-400">
                          Size: {formatFileSize(brand.size)}
                        </span>
                      </div>
                    </td>

                    {/* Active/Inactive Toggle */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(brand)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            brand.isActive ? "bg-emerald-500" : "bg-neutral-700"
                          }`}
                          role="switch"
                          aria-checked={brand.isActive}
                          title={brand.isActive ? "Click to deactivate" : "Click to activate"}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              brand.isActive ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span
                          className={`font-mono text-[11px] font-bold ${
                            brand.isActive ? "text-emerald-400" : "text-neutral-500"
                          }`}
                        >
                          {brand.isActive ? "Active" : "Hidden"}
                        </span>
                      </div>
                    </td>

                    {/* Reorder Buttons */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0 || isReordering}
                          onClick={() => handleMoveOrder(index, "up")}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                          title="Move up"
                        >
                          <MoveUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={index === filteredBrands.length - 1 || isReordering}
                          onClick={() => handleMoveOrder(index, "down")}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                          title="Move down"
                        >
                          <MoveDown size={14} />
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(brand)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/20 text-neutral-300 hover:text-blue-400 border border-white/10 hover:border-blue-500/30 transition-all cursor-pointer"
                          title="Edit brand"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setBrandToDelete(brand)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
                          title="Delete brand"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal (Add / Edit) */}
      <BrandCollaborationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingBrand}
        totalBrandsCount={brands.length}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(brandToDelete)}
        title="Delete Brand Collaboration"
        message="The logo asset will be removed and this brand will no longer appear on the public website."
        itemTitle={brandToDelete?.name}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setBrandToDelete(null)}
      />

      {/* Lightbox Modal for Logo Inspection */}
      {previewingLogo && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setPreviewingLogo(null)}
        >
          <div
            className="relative max-w-lg w-full bg-[#141824] border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewingLogo(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <h4 className="font-['Syne',sans-serif] font-bold text-lg text-white">
              {previewingLogo.name}
            </h4>

            {/* Checkerboard container for transparency inspection */}
            <div className="w-full h-48 rounded-2xl bg-[#0b0e17] border border-white/10 p-6 flex items-center justify-center">
              <img
                src={previewingLogo.url}
                alt={previewingLogo.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-lg"
              />
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                {previewingLogo.format || "WEBP"}
              </span>
              <span>Size: {formatFileSize(previewingLogo.size)}</span>
              <a
                href={previewingLogo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 underline flex items-center gap-1"
              >
                Open Original <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
