import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import DOMPurify from "dompurify";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo2,
  Redo2,
  Link2,
  Unlink,
  Image as ImageIcon,
  Eye,
  Edit3,
  UploadCloud,
  X,
  Check,
  ExternalLink,
  Trash2,
  Maximize2,
  Loader2,
} from "lucide-react";
import { adminService } from "../../services/service/adminService";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onUploadImage?: (file: File) => Promise<string>;
}

/**
 * Extended TipTap Image extension that supports:
 * - Responsive Widths (25%, 33%, 50%, 75%, 100%)
 * - Text Wrapping & Alignments (float left, float right, center block, full width)
 * - Custom Aspect Ratios (16:9, 4:3, 1:1, 21:9, auto)
 * - Object Fit (cover, contain)
 * - Zoom Scaling (1x to 1.5x)
 * - Captions & Alt attributes
 */
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
      },
      alt: {
        default: "",
      },
      title: {
        default: null,
      },
      width: {
        default: "100%",
        parseHTML: (element) => element.getAttribute("data-width") || element.style.width || "100%",
        renderHTML: (attributes) => ({
          "data-width": attributes.width,
        }),
      },
      alignment: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-alignment") || "center",
        renderHTML: (attributes) => ({
          "data-alignment": attributes.alignment,
        }),
      },
      aspectRatio: {
        default: "auto",
        parseHTML: (element) => element.getAttribute("data-aspect-ratio") || "auto",
        renderHTML: (attributes) => ({
          "data-aspect-ratio": attributes.aspectRatio,
        }),
      },
      objectFit: {
        default: "cover",
        parseHTML: (element) => element.getAttribute("data-object-fit") || "cover",
        renderHTML: (attributes) => ({
          "data-object-fit": attributes.objectFit,
        }),
      },
      zoom: {
        default: "1",
        parseHTML: (element) => element.getAttribute("data-zoom") || "1",
        renderHTML: (attributes) => ({
          "data-zoom": attributes.zoom,
        }),
      },
      caption: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-caption") || "",
        renderHTML: (attributes) => ({
          "data-caption": attributes.caption,
        }),
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const width = HTMLAttributes["data-width"] || "100%";
    const alignment = HTMLAttributes["data-alignment"] || "center";
    const aspectRatio = HTMLAttributes["data-aspect-ratio"] || "auto";
    const objectFit = HTMLAttributes["data-object-fit"] || "cover";
    const zoom = HTMLAttributes["data-zoom"] || "1";

    let margin = "1.5rem auto";
    let float = "none";
    let display = "block";

    if (alignment === "left") {
      margin = "0.5rem 1.5rem 1rem 0";
      float = "left";
      display = "inline-block";
    } else if (alignment === "right") {
      margin = "0.5rem 0 1rem 1.5rem";
      float = "right";
      display = "inline-block";
    } else if (alignment === "center") {
      margin = "1.5rem auto";
      float = "none";
      display = "block";
    } else if (alignment === "full") {
      margin = "1.75rem 0";
      float = "none";
      display = "block";
    }

    const styles = [
      `width: ${width}`,
      `max-width: 100%`,
      `margin: ${margin}`,
      float !== "none" ? `float: ${float}` : "",
      `display: ${display}`,
      aspectRatio !== "auto" ? `aspect-ratio: ${aspectRatio}` : "",
      `object-fit: ${objectFit}`,
      zoom && zoom !== "1" ? `transform: scale(${zoom})` : "",
      `transition: transform 0.25s ease, width 0.25s ease`,
    ].filter(Boolean).join("; ");

    return [
      "img",
      {
        ...HTMLAttributes,
        class: `blog-custom-img blog-img-${alignment}`,
        style: styles,
      },
    ];
  },
});

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your editorial article content here with full rich text...",
  onUploadImage,
}) => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Inline Link Configuration Bar State (NO intrusive popups, NO form element)
  const [isLinkBarOpen, setIsLinkBarOpen] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState<boolean>(true);
  const [linkError, setLinkError] = useState<string>("");

  // Multi-Image Uploading State
  const [isUploadingImages, setIsUploadingImages] = useState<boolean>(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>("");
  const [isImageUrlOpen, setIsImageUrlOpen] = useState<boolean>(false);
  const [singleImageUrl, setSingleImageUrl] = useState<string>("");
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  // Selected Image Customization Inspector State
  const [selectedImageAttrs, setSelectedImageAttrs] = useState<{
    src: string;
    alt?: string;
    width?: string;
    alignment?: string;
    aspectRatio?: string;
    objectFit?: string;
    zoom?: string;
    caption?: string;
  } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
          class: "text-cyan-400 hover:text-cyan-300 underline font-semibold transition-colors cursor-pointer",
        },
        validate: (href) => /^https?:\/\//.test(href) || /^mailto:/.test(href),
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CustomImage,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      handleClickOn: (_view, _pos, node) => {
        if (node.type.name === "image") {
          setSelectedImageAttrs({
            src: node.attrs.src,
            alt: node.attrs.alt || "",
            width: node.attrs.width || "100%",
            alignment: node.attrs.alignment || "center",
            aspectRatio: node.attrs.aspectRatio || "auto",
            objectFit: node.attrs.objectFit || "cover",
            zoom: node.attrs.zoom || "1",
            caption: node.attrs.caption || "",
          });
        }
        return false;
      },
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[320px] p-4 sm:p-5 font-['Space_Grotesk',sans-serif] text-neutral-200 text-sm leading-relaxed",
        "data-placeholder": placeholder,
      },
    },
  });

  // Track image selection on selection changes
  useEffect(() => {
    if (!editor) return;

    const updateImageSelection = () => {
      if (editor.isActive("image")) {
        const attrs = editor.getAttributes("image");
        if (attrs && attrs.src) {
          setSelectedImageAttrs({
            src: attrs.src,
            alt: attrs.alt || "",
            width: attrs.width || "100%",
            alignment: attrs.alignment || "center",
            aspectRatio: attrs.aspectRatio || "auto",
            objectFit: attrs.objectFit || "cover",
            zoom: attrs.zoom || "1",
            caption: attrs.caption || "",
          });
          return;
        }
      }
      setSelectedImageAttrs(null);
    };

    editor.on("selectionUpdate", updateImageSelection);
    editor.on("transaction", updateImageSelection);

    return () => {
      editor.off("selectionUpdate", updateImageSelection);
      editor.off("transaction", updateImageSelection);
    };
  }, [editor]);

  // Sync internal editor state if value changes externally
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml && (value || currentHtml !== "<p></p>")) {
      if (value !== currentHtml) {
        editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
      }
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="w-full h-48 rounded-2xl bg-[#141620] border border-white/10 animate-pulse flex items-center justify-center text-neutral-500 font-mono text-xs">
        Initializing Rich Text Editor...
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // INLINE HYPERLINK HANDLERS (No modals, no nested forms, stops propagation)
  // --------------------------------------------------------------------------
  const toggleLinkBar = () => {
    if (isLinkBarOpen) {
      setIsLinkBarOpen(false);
      setLinkError("");
    } else {
      setLinkError("");
      const previousUrl = editor.getAttributes("link").href;
      setLinkUrl(previousUrl || "");
      const target = editor.getAttributes("link").target;
      setLinkOpenInNewTab(target !== "_self");
      setIsLinkBarOpen(true);
      setIsImageUrlOpen(false);
    }
  };

  const handleApplyLink = () => {
    setLinkError("");
    const trimmed = linkUrl.trim();

    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setIsLinkBarOpen(false);
      return;
    }

    // Reject dangerous protocols
    if (/^(javascript|vbscript|data):/i.test(trimmed)) {
      setLinkError("Dangerous link protocols are strictly forbidden.");
      return;
    }

    let finalUrl = trimmed;
    if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    const { from, to } = editor.state.selection;
    if (from === to) {
      // No text highlighted: insert clickable link text directly
      editor
        .chain()
        .focus()
        .insertContent(
          `<a href="${finalUrl}" target="${linkOpenInNewTab ? "_blank" : "_self"}" rel="${
            linkOpenInNewTab ? "noopener noreferrer" : ""
          }">${finalUrl}</a> `
        )
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({
          href: finalUrl,
          target: linkOpenInNewTab ? "_blank" : "_self",
          rel: linkOpenInNewTab ? "noopener noreferrer" : undefined,
        })
        .run();
    }

    setIsLinkBarOpen(false);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setIsLinkBarOpen(false);
  };

  // --------------------------------------------------------------------------
  // MULTI-IMAGE UPLOADING & INSERTION (Multiple images at once)
  // --------------------------------------------------------------------------
  const handleMultipleFilesUpload = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    try {
      setIsUploadingImages(true);
      const total = files.length;

      for (let i = 0; i < total; i++) {
        const file = files[i];
        setUploadProgressText(`Uploading image ${i + 1} of ${total} (${file.name})...`);

        let uploadedUrl = "";
        if (onUploadImage) {
          uploadedUrl = await onUploadImage(file);
        } else {
          const res = await adminService.uploadMedia(file);
          uploadedUrl = res?.url || res?.data?.url || (res as any)?.fileUrl;
        }

        if (uploadedUrl) {
          const initialWidth = total > 1 ? "50%" : "100%";
          const initialAlign = total > 1 ? (i % 2 === 0 ? "left" : "right") : "center";

          editor
            .chain()
            .focus()
            .insertContent({
              type: "image",
              attrs: {
                src: uploadedUrl,
                alt: file.name.replace(/\.[^/.]+$/, ""),
                width: initialWidth,
                alignment: initialAlign,
                aspectRatio: "auto",
                objectFit: "cover",
                zoom: "1",
              },
            })
            .run();
        }
      }
    } catch (err: any) {
      alert("Image upload error: " + (err.message || "Failed to upload image"));
    } finally {
      setIsUploadingImages(false);
      setUploadProgressText("");
      if (multiFileInputRef.current) {
        multiFileInputRef.current.value = "";
      }
    }
  };

  const handleInsertImageUrl = () => {
    const trimmed = singleImageUrl.trim();
    if (!trimmed) return;
    editor.chain().focus().setImage({ src: trimmed, alt: "Article Image" }).run();
    setSingleImageUrl("");
    setIsImageUrlOpen(false);
  };

  // --------------------------------------------------------------------------
  // IMAGE ATTRIBUTE CUSTOMIZATIONS (Position, Resize, Crop, Zoom, Caption)
  // --------------------------------------------------------------------------
  const updateImageAttribute = (key: string, val: any) => {
    if (!editor) return;
    editor.chain().focus().updateAttributes("image", { [key]: val }).run();
    setSelectedImageAttrs((prev) => (prev ? { ...prev, [key]: val } : null));
  };

  const removeSelectedImage = () => {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
    setSelectedImageAttrs(null);
  };

  return (
    <div className="flex flex-col w-full rounded-2xl bg-[#11131b] border border-white/10 overflow-hidden shadow-xl">
      {/* Top Header / Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#0c0d12] border-b border-white/10 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
          <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            Rich Article Editor
          </span>
          <span className="hidden sm:inline font-mono text-[10px] text-neutral-400">
            · Multi-Image Layouts, Resizing, Positioning &amp; Hyperlinks
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#181a24] p-0.5 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab("edit");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "edit"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Edit3 size={12} />
            <span>Visual Editor</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab("preview");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Eye size={12} />
            <span>Article Preview</span>
          </button>
        </div>
      </div>

      {activeTab === "edit" ? (
        <>
          {/* Main Formatting Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-2 bg-[#141620] border-b border-white/10 text-neutral-300">
            {/* Undo / Redo */}
            <div className="flex items-center gap-0.5 pr-1.5 border-r border-white/10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().undo().run();
                }}
                disabled={!editor.can().undo()}
                title="Undo (Ctrl+Z)"
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <Undo2 size={14} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().redo().run();
                }}
                disabled={!editor.can().redo()}
                title="Redo (Ctrl+Y)"
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <Redo2 size={14} />
              </button>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-1 px-1.5 border-r border-white/10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().setParagraph().run();
                }}
                className={`px-2 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                  editor.isActive("paragraph")
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "hover:bg-white/10 text-neutral-300"
                }`}
                title="Normal Paragraph"
              >
                Normal
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                }}
                className={`px-2 py-1 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                  editor.isActive("heading", { level: 2 })
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "hover:bg-white/10 text-neutral-300"
                }`}
                title="Heading 2"
              >
                H2
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().toggleHeading({ level: 3 }).run();
                }}
                className={`px-2 py-1 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                  editor.isActive("heading", { level: 3 })
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "hover:bg-white/10 text-neutral-300"
                }`}
                title="Heading 3"
              >
                H3
              </button>
            </div>

            {/* Inline Formatting */}
            <div className="flex items-center gap-0.5 px-1.5 border-r border-white/10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().toggleBold().run();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  editor.isActive("bold")
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "hover:bg-white/10 text-neutral-300"
                }`}
                title="Bold (Ctrl+B)"
              >
                <Bold size={14} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().toggleItalic().run();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  editor.isActive("italic")
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "hover:bg-white/10 text-neutral-300"
                }`}
                title="Italic (Ctrl+I)"
              >
                <Italic size={14} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().toggleUnderline().run();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  editor.isActive("underline")
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "hover:bg-white/10 text-neutral-300"
                }`}
                title="Underline (Ctrl+U)"
              >
                <UnderlineIcon size={14} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().toggleStrike().run();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  editor.isActive("strike")
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "hover:bg-white/10 text-neutral-300"
                }`}
                title="Strikethrough"
              >
                <Strikethrough size={14} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().toggleCode().run();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  editor.isActive("code")
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "hover:bg-white/10 text-neutral-300"
                }`}
                title="Inline Code"
              >
                <Code size={14} />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-0.5 px-1.5 border-r border-white/10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().setTextAlign("left").run();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  editor.isActive({ textAlign: "left" })
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "hover:bg-white/10 text-neutral-300"
                }`}
                title="Align Left"
              >
                <AlignLeft size={14} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().setTextAlign("center").run();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  editor.isActive({ textAlign: "center" })
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "hover:bg-white/10 text-neutral-300"
                }`}
                title="Align Center"
              >
                <AlignCenter size={14} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().setTextAlign("right").run();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  editor.isActive({ textAlign: "right" })
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "hover:bg-white/10 text-neutral-300"
                }`}
                title="Align Right"
              >
                <AlignRight size={14} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().setTextAlign("justify").run();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  editor.isActive({ textAlign: "justify" })
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "hover:bg-white/10 text-neutral-300"
                }`}
                title="Align Justify"
              >
                <AlignJustify size={14} />
              </button>
            </div>

            {/* Lists */}
            <div className="flex items-center gap-0.5 px-1.5 border-r border-white/10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().toggleBulletList().run();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  editor.isActive("bulletList")
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "hover:bg-white/10 text-neutral-300"
                }`}
                title="Bullet List"
              >
                <List size={14} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().toggleOrderedList().run();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  editor.isActive("orderedList")
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "hover:bg-white/10 text-neutral-300"
                }`}
                title="Numbered List"
              >
                <ListOrdered size={14} />
              </button>
            </div>

            {/* Blockquote & Divider */}
            <div className="flex items-center gap-0.5 px-1.5 border-r border-white/10">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().toggleBlockquote().run();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  editor.isActive("blockquote")
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "hover:bg-white/10 text-neutral-300"
                }`}
                title="Blockquote"
              >
                <Quote size={14} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.chain().focus().setHorizontalRule().run();
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 transition-colors cursor-pointer"
                title="Horizontal Divider"
              >
                <Minus size={14} />
              </button>
            </div>

            {/* Links & Images */}
            <div className="flex items-center gap-1 pl-1.5">
              {/* Direct Inline Link Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleLinkBar();
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono font-bold ${
                  editor.isActive("link") || isLinkBarOpen
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "hover:bg-white/10 text-neutral-300"
                }`}
                title="Add or Edit Hyperlink (Direct Inline - No Popups)"
              >
                <Link2 size={14} />
                <span>Link</span>
              </button>

              {/* Multi-Image File Input (Hidden) */}
              <input
                ref={multiFileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleMultipleFilesUpload(e.target.files);
                }}
              />

              {/* Upload Multiple Images Button */}
              <button
                type="button"
                disabled={isUploadingImages}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  multiFileInputRef.current?.click();
                }}
                className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono font-bold"
                title="Upload one or multiple images at once"
              >
                {isUploadingImages ? (
                  <Loader2 size={14} className="animate-spin text-cyan-400" />
                ) : (
                  <UploadCloud size={14} />
                )}
                <span>+ Upload Images</span>
              </button>

              {/* Image by URL Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsImageUrlOpen(!isImageUrlOpen);
                  setIsLinkBarOpen(false);
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono ${
                  isImageUrlOpen ? "bg-white/15 text-white" : "hover:bg-white/10 text-neutral-400"
                }`}
                title="Insert Image by Web URL"
              >
                <ImageIcon size={14} />
                <span className="hidden sm:inline">URL</span>
              </button>
            </div>
          </div>

          {/* 1. Direct Inline Link Bar (NO POPUP, NO FORM - 100% RELIABLE) */}
          {isLinkBarOpen && (
            <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 bg-[#0e1017] border-b border-cyan-500/30 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-1 text-cyan-400 font-mono text-[11px] font-bold shrink-0">
                <Link2 size={13} className="text-cyan-400" />
                <span>HYPERLINK:</span>
              </div>

              <div className="flex-1 min-w-[200px] flex items-center gap-1.5">
                <input
                  type="text"
                  autoFocus
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    setLinkError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleApplyLink();
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsLinkBarOpen(false);
                    }
                  }}
                  placeholder="Paste or type URL (e.g. https://bharatdigiguru.com/case-study)"
                  className="w-full bg-black/60 border border-cyan-500/30 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLinkOpenInNewTab(!linkOpenInNewTab);
                }}
                className={`px-2 py-1 rounded-md text-[10px] font-mono font-semibold uppercase flex items-center gap-1 cursor-pointer transition-colors ${
                  linkOpenInNewTab
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "bg-white/5 text-neutral-400 hover:text-white"
                }`}
                title="Toggle Open in New Tab"
              >
                <span>New Tab</span>
                <ExternalLink size={10} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleApplyLink();
                }}
                className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-md shadow-cyan-900/30 shrink-0"
              >
                <Check size={12} />
                <span>Apply Link</span>
              </button>

              {editor.isActive("link") && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveLink();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-xs font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                  title="Remove hyperlink"
                >
                  <Unlink size={12} />
                  <span>Unlink</span>
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsLinkBarOpen(false);
                }}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
                title="Cancel"
              >
                <X size={13} />
              </button>

              {linkError && (
                <div className="w-full text-[10px] font-mono text-red-400 pt-0.5">
                  {linkError}
                </div>
              )}
            </div>
          )}

          {/* 2. Insert Image URL Bar */}
          {isImageUrlOpen && (
            <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 bg-[#0e1017] border-b border-white/10 animate-in fade-in slide-in-from-top-2 duration-150">
              <span className="font-mono text-[11px] text-neutral-400 font-bold uppercase">Image URL:</span>
              <input
                type="text"
                autoFocus
                value={singleImageUrl}
                onChange={(e) => setSingleImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleInsertImageUrl();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsImageUrlOpen(false);
                  }
                }}
                placeholder="https://images.unsplash.com/... or CDN link"
                className="flex-1 min-w-[200px] bg-black/60 border border-white/15 rounded-lg px-2.5 py-1 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleInsertImageUrl();
                }}
                disabled={!singleImageUrl.trim()}
                className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-mono text-xs font-bold uppercase cursor-pointer"
              >
                Insert
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsImageUrlOpen(false);
                }}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* 3. Upload Progress Banner */}
          {isUploadingImages && (
            <div className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border-b border-cyan-500/20 text-cyan-300 font-mono text-xs">
              <Loader2 size={13} className="animate-spin text-cyan-400" />
              <span>{uploadProgressText || "Processing and converting images..."}</span>
            </div>
          )}

          {/* 4. Selected Image Customization Inspector Bar */}
          {selectedImageAttrs && (
            <div className="flex flex-col gap-2 p-3 bg-[#0a0c12] border-b border-cyan-500/30 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-cyan-400" />
                    <span>Customizing Image Asset</span>
                  </span>
                  <span className="font-mono text-[10px] text-neutral-400 truncate max-w-xs hidden md:inline">
                    ({selectedImageAttrs.src})
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeSelectedImage();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono font-bold uppercase flex items-center gap-1 cursor-pointer transition-colors"
                    title="Remove image from article"
                  >
                    <Trash2 size={12} />
                    <span>Delete Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedImageAttrs(null);
                    }}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
                    title="Deselect image"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                {/* Position / Alignment Controls */}
                <div className="flex items-center gap-1 bg-[#141620] p-1 rounded-xl border border-white/10">
                  <span className="text-[10px] text-neutral-400 px-1 font-bold uppercase">Position:</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateImageAttribute("alignment", "left");
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      selectedImageAttrs.alignment === "left"
                        ? "bg-cyan-600 text-white"
                        : "text-neutral-400 hover:text-white"
                    }`}
                    title="Float Left (Text wraps on right)"
                  >
                    <AlignLeft size={11} />
                    <span>Float Left</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateImageAttribute("alignment", "center");
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      selectedImageAttrs.alignment === "center"
                        ? "bg-cyan-600 text-white"
                        : "text-neutral-400 hover:text-white"
                    }`}
                    title="Center (Block centered)"
                  >
                    <AlignCenter size={11} />
                    <span>Center</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateImageAttribute("alignment", "right");
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      selectedImageAttrs.alignment === "right"
                        ? "bg-cyan-600 text-white"
                        : "text-neutral-400 hover:text-white"
                    }`}
                    title="Float Right (Text wraps on left)"
                  >
                    <AlignRight size={11} />
                    <span>Float Right</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateImageAttribute("alignment", "full");
                      updateImageAttribute("width", "100%");
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      selectedImageAttrs.alignment === "full"
                        ? "bg-cyan-600 text-white"
                        : "text-neutral-400 hover:text-white"
                    }`}
                    title="Full Width Block (100%)"
                  >
                    <Maximize2 size={11} />
                    <span>Full Width</span>
                  </button>
                </div>

                {/* Resize Presets & Slider */}
                <div className="flex items-center gap-1 bg-[#141620] p-1 rounded-xl border border-white/10">
                  <span className="text-[10px] text-neutral-400 px-1 font-bold uppercase">Size:</span>
                  {["25%", "33%", "50%", "75%", "100%"].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateImageAttribute("width", pct);
                      }}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                        selectedImageAttrs.width === pct
                          ? "bg-cyan-600 text-white"
                          : "text-neutral-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {pct}
                    </button>
                  ))}

                  <div className="flex items-center gap-1 pl-1 border-l border-white/10">
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={parseInt(selectedImageAttrs.width || "100", 10) || 100}
                      onChange={(e) => updateImageAttribute("width", `${e.target.value}%`)}
                      className="w-16 sm:w-20 accent-cyan-500 cursor-pointer"
                      title="Drag width slider"
                    />
                  </div>
                </div>

                {/* Zoom Scale */}
                <div className="flex items-center gap-1 bg-[#141620] p-1 rounded-xl border border-white/10">
                  <span className="text-[10px] text-neutral-400 px-1 font-bold uppercase">Zoom:</span>
                  {[
                    { label: "1x", val: "1" },
                    { label: "1.15x", val: "1.15" },
                    { label: "1.3x", val: "1.3" },
                    { label: "1.5x", val: "1.5" },
                  ].map((z) => (
                    <button
                      key={z.val}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateImageAttribute("zoom", z.val);
                      }}
                      className={`px-1.5 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                        (selectedImageAttrs.zoom || "1") === z.val
                          ? "bg-cyan-600 text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {z.label}
                    </button>
                  ))}
                </div>

                {/* Crop / Aspect Ratio */}
                <div className="flex items-center gap-1 bg-[#141620] p-1 rounded-xl border border-white/10">
                  <span className="text-[10px] text-neutral-400 px-1 font-bold uppercase">Crop / Ratio:</span>
                  {[
                    { label: "Auto", val: "auto" },
                    { label: "16:9", val: "16/9" },
                    { label: "4:3", val: "4/3" },
                    { label: "1:1", val: "1/1" },
                    { label: "21:9", val: "21/9" },
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateImageAttribute("aspectRatio", r.val);
                      }}
                      className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                        (selectedImageAttrs.aspectRatio || "auto") === r.val
                          ? "bg-cyan-600 text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {/* Fit mode: Cover vs Contain */}
                <div className="flex items-center gap-1 bg-[#141620] p-1 rounded-xl border border-white/10">
                  <span className="text-[10px] text-neutral-400 px-1 font-bold uppercase">Fit:</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateImageAttribute("objectFit", "cover");
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                      selectedImageAttrs.objectFit === "cover"
                        ? "bg-cyan-600 text-white"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Cover
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateImageAttribute("objectFit", "contain");
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                      selectedImageAttrs.objectFit === "contain"
                        ? "bg-cyan-600 text-white"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Contain
                  </button>
                </div>

                {/* Alt / Caption Text Input */}
                <div className="flex-1 min-w-[200px] flex items-center gap-1 bg-[#141620] px-2 py-1 rounded-xl border border-white/10">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase shrink-0">Caption:</span>
                  <input
                    type="text"
                    value={selectedImageAttrs.alt || ""}
                    onChange={(e) => updateImageAttribute("alt", e.target.value)}
                    placeholder="Image description or caption..."
                    className="w-full bg-transparent text-[11px] font-mono text-cyan-200 placeholder-neutral-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Editor Content Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleMultipleFilesUpload(e.dataTransfer.files);
              }
            }}
            className="relative min-h-[360px] bg-[#0c0d12]/95 cursor-text focus-within:ring-1 focus-within:ring-cyan-500/40"
          >
            <EditorContent editor={editor} />
          </div>
        </>
      ) : (
        /* Live Article Preview Tab */
        <div className="p-6 bg-[#0c0d12] min-h-[360px] overflow-y-auto">
          <div className="mb-4 pb-3 border-b border-white/10 flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>LIVE EDITORIAL ARTICLE PREVIEW</span>
            <span className="text-emerald-400">● Sanitized Safe HTML Preview</span>
          </div>

          <div
            className="blog-rich-content text-neutral-200"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(editor.getHTML(), {
                ADD_ATTR: [
                  "target",
                  "rel",
                  "style",
                  "class",
                  "width",
                  "height",
                  "loading",
                  "data-width",
                  "data-alignment",
                  "data-aspect-ratio",
                  "data-object-fit",
                  "data-zoom",
                  "data-caption",
                ],
                ADD_TAGS: ["figure", "figcaption", "iframe"],
              }),
            }}
          />
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
