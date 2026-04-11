import DOMPurify from "dompurify";

export function sanitizePostHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "u", "s", "strike", "ul", "ol", "li", "a", "h1", "h2", "h3", "blockquote", "code", "pre"],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });
}
