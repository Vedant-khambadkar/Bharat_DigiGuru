import React from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  itemTitle?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this record? This action cannot be undone.",
  itemTitle,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 admin-scope"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-md bg-[#12131a] border border-white/10 rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Heading */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-neutral-400 mt-1 leading-relaxed">
              {message}
            </p>
            {itemTitle && (
              <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-neutral-200 truncate font-mono">
                {itemTitle}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-medium text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isLoading ? "Deleting..." : "Delete Record"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
