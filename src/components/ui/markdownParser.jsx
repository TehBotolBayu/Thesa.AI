"use client";
import { LinkRenderer } from "@/lib/general/parser";
import { normalizeMath, URLDetector } from "@/lib/markdownUtil/parser";
import "katex/dist/katex.min.css";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

// URL Detection utility
const MarkdownParser = ({ content, ...props }) => {
  const urlDetector = useMemo(() => new URLDetector(), []);
  // Process message content with URL detection
  const processedContent = useMemo(() => {
      // For AI messages, convert URLs to markdown and normalize math
      const withUrls = urlDetector.convertUrlsToMarkdown(content);
      return normalizeMath(withUrls);
  }, [content, urlDetector]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // Custom link component with styling
        a: LinkRenderer,
        // Optional: Style other elements
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="list-disc pl-4 mb-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-4 mb-2">{children}</ol>
        ),
        li: ({ children }) => <li className="mb-1">{children}</li>,
        code: ({ inline, children }) =>
          inline ? (
            <code className="bg-gray-700 px-1 py-0.5 rounded text-sm">
              {children}
            </code>
          ) : (
            <code className="block bg-gray-700 p-2 rounded text-sm overflow-x-auto">
              {children}
            </code>
          ),
        pre: ({ children }) => (
          <pre className="bg-gray-700 p-2 rounded overflow-x-auto mb-2">
            {children}
          </pre>
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

export default MarkdownParser;
