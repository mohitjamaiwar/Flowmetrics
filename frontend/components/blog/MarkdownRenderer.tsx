"use client";

/**
 * MarkdownRenderer — renders Markdown safely for public display.
 *
 * SECURITY BOUNDARY:
 * Blog content is stored as Markdown in MongoDB, written by an authenticated
 * admin. Despite coming from a trusted source, we treat it as untrusted at
 * render time because:
 *   1. The admin account could be compromised.
 *   2. Stored XSS payloads could have slipped in before a security fix.
 *   3. Defense-in-depth: multiple layers are better than relying on one.
 *
 * We use react-markdown (which converts Markdown to React elements, never
 * raw HTML) combined with a custom component override that rejects dangerous
 * URL schemes in links and images. This avoids dangerouslySetInnerHTML
 * entirely for normal Markdown content.
 *
 * If the content contains raw HTML fenced blocks, react-markdown skips them
 * by default (rehype-raw is NOT enabled here intentionally).
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

/** Allow only safe URL schemes in links and images. */
function isSafeUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url, "https://base.invalid");
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

const components: Components = {
  // Reject javascript: / data: links — only allow http(s)
  a({ href, children, ...rest }) {
    if (!isSafeUrl(href)) {
      // Render as plain text, not a clickable link
      return <span>{children}</span>;
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  },
  // Reject javascript: / data: image sources
  img({ src, alt, ...rest }) {
    if (!isSafeUrl(src)) {
      return null;
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt ?? ""} {...rest} />;
  },
};

interface Props {
  content: string;
}

export function MarkdownRenderer({ content }: Props) {
  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
