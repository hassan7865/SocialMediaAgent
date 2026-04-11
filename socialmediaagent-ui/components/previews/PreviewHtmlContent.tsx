import { sanitizePostHtml } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";

interface PreviewHtmlContentProps {
  html: string;
  className?: string;
}

export function PreviewHtmlContent({ html, className }: PreviewHtmlContentProps) {
  const safe = sanitizePostHtml(html);
  if (!safe.replace(/<[^>]*>/g, "").trim()) {
    return (
      <p className={cn("text-sm italic text-on-surface-variant", className)}>
        Start typing — your preview updates live.
      </p>
    );
  }
  return (
    <div
      className={cn(
        "preview-html text-sm leading-relaxed text-on-surface [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-outline-variant [&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-surface-container-low [&_code]:px-1 [&_code]:text-xs [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-surface-container-low [&_pre]:p-2 [&_pre]:text-xs [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
