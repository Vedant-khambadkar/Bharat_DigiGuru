import sanitizeHtmlLibrary from "sanitize-html";

export const sanitizeBlogContent = (rawContent: string | string[]): string | string[] => {
  const options: sanitizeHtmlLibrary.IOptions = {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "b",
      "strong",
      "i",
      "em",
      "u",
      "s",
      "strike",
      "del",
      "code",
      "pre",
      "blockquote",
      "ul",
      "ol",
      "li",
      "hr",
      "br",
      "span",
      "div",
      "a",
      "img",
      "figure",
      "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title", "class", "style"],
      img: [
        "src",
        "alt",
        "title",
        "width",
        "height",
        "class",
        "loading",
        "style",
        "data-width",
        "data-alignment",
        "data-aspect-ratio",
        "data-object-fit",
        "data-zoom",
        "data-caption",
      ],
      figure: ["class", "style"],
      figcaption: ["class", "style"],
      div: ["class", "style"],
      span: ["class", "style"],
      p: ["class", "style"],
      h1: ["class", "style"],
      h2: ["class", "style"],
      h3: ["class", "style"],
      h4: ["class", "style"],
      h5: ["class", "style"],
      h6: ["class", "style"],
      blockquote: ["class", "style"],
      code: ["class"],
      pre: ["class"],
      ul: ["class", "style"],
      ol: ["class", "style"],
      li: ["class", "style"],
    },
    allowedStyles: {
      "*": {
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
        "width": [/^[\d.]+(%|px|rem|em|vw|auto)$/],
        "max-width": [/^[\d.]+(%|px|rem|em|vw|auto)$/],
        "height": [/^(auto|[\d.]+(%|px|rem|em|vh))$/],
        "margin": [/^[a-zA-Z0-9.\s%_-]+$/],
        "margin-left": [/^[a-zA-Z0-9.\s%_-]+$/],
        "margin-right": [/^[a-zA-Z0-9.\s%_-]+$/],
        "margin-top": [/^[a-zA-Z0-9.\s%_-]+$/],
        "margin-bottom": [/^[a-zA-Z0-9.\s%_-]+$/],
        "float": [/^(none|left|right)$/],
        "display": [/^(block|inline-block|inline|flex)$/],
        "object-fit": [/^(cover|contain|fill|none|scale-down)$/],
        "aspect-ratio": [/^[a-zA-Z0-9.\s\/_-]+$/],
        "transform": [/^[a-zA-Z0-9.\s(),_-]+$/],
        "transition": [/^[a-zA-Z0-9.\s(),_-]+$/],
        "border-radius": [/^[a-zA-Z0-9.\s%_-]+$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https"],
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = (attribs.href || "").trim();
        // Disallow dangerous protocols like javascript:
        if (/^(javascript|vbscript|data):/i.test(href)) {
          delete attribs.href;
        }

        // Enforce safe target and rel attributes for external links
        if (attribs.target === "_blank" || href.startsWith("http")) {
          attribs.target = "_blank";
          attribs.rel = "noopener noreferrer";
        }
        return {
          tagName,
          attribs,
        };
      },
      img: (tagName, attribs) => {
        const src = (attribs.src || "").trim();
        if (/^(javascript|vbscript):/i.test(src)) {
          delete attribs.src;
        }
        attribs.loading = "lazy";
        return {
          tagName,
          attribs,
        };
      },
    },
  };

  if (Array.isArray(rawContent)) {
    return rawContent.map((item) => sanitizeHtmlLibrary(String(item || ""), options));
  }

  if (typeof rawContent === "string") {
    return sanitizeHtmlLibrary(rawContent, options);
  }

  return "";
};
