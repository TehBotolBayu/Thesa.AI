"use client";
import { LinkRenderer } from "@/lib/general/parser";
import { normalizeMath, URLDetector } from "@/lib/markdownUtil/parser";
import "katex/dist/katex.min.css";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
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
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // Custom link component with styling
        a: LinkRenderer,
        // Optional: Style other elements
        p: ({ children }) => <p className="mb-2 last:mb-0 text-sm">{children}</p>,
        ul: ({ children }) => (
          <ul className="list-disc pl-4 mb-2 text-sm">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-4 mb-2 text-sm">{children}</ol>
        ),
        li: ({ children }) => <li className="mb-1 text-sm">{children}</li>,
        code: ({ inline, children }) =>
          inline ? (
            <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded text-sm font-mono border border-gray-200 dark:border-gray-700">
              {children}
            </code>
          ) : (
            <code className="text-sm font-mono">
              {children}
            </code>
          ),
        pre: ({ children }) => (
          <pre className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 rounded-md overflow-x-auto mb-2 border border-gray-200 dark:border-gray-700">
            {children}
          </pre>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-md text-sm">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-gray-50 dark:bg-gray-800">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {children}
          </tbody>
        ),
        tr: ({ children }) => <tr>{children}</tr>,
        th: ({ children }) => (
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 whitespace-normal text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
            {children}
          </td>
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

export default MarkdownParser;
