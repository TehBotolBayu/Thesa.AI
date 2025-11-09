"use client";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import { GraduationCap, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import ChatbotEmailForm from "./form/chatbotEmailForm";
import { LinkRenderer } from "@/lib/general/parser";

// URL Detection utility
class URLDetector {
  constructor() {
    // Comprehensive URL regex pattern
    this.urlPattern =
      /(?:(?:https?|ftp|ftps):\/\/)?(?:www\.)?(?:[\w-]+\.)+[a-z]{2,}(?:\/[^\s]*)?/gi;
    this.protocolPattern = /^(https?|ftp|ftps):\/\//i;
  }

  // Extract all URLs from text
  extractUrls(text) {
    if (!text || typeof text !== "string") return [];
    const matches = text.match(this.urlPattern) || [];
    return [...new Set(matches)]; // Remove duplicates
  }

  // Validate if a string is a valid URL
  isValidUrl(url) {
    if (!url || typeof url !== "string") return false;
    try {
      const urlToTest = this.protocolPattern.test(url) ? url : `https://${url}`;
      const urlObj = new URL(urlToTest);
      return (
        urlObj.protocol === "http:" ||
        urlObj.protocol === "https:" ||
        urlObj.protocol === "ftp:" ||
        urlObj.protocol === "ftps:"
      );
    } catch (error) {
      return false;
    }
  }

  // Convert URLs to proper format
  normalizeUrl(url) {
    if (this.protocolPattern.test(url)) return url;
    return `https://${url}`;
  }

  // Convert plain text URLs to markdown links
  convertUrlsToMarkdown(text) {
    if (!text) return text;

    // Find all URLs in the text
    const urls = this.extractUrls(text);
    let result = text;

    urls.forEach((url) => {
      if (this.isValidUrl(url)) {
        const normalizedUrl = this.normalizeUrl(url);
        // Only convert if it's not already a markdown link
        const linkPattern = new RegExp(
          `\\[.*?\\]\\(.*?${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}.*?\\)`,
          "gi"
        );

        if (!linkPattern.test(result)) {
          // Replace plain URL with markdown link
          const urlRegex = new RegExp(
            url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "gi"
          );
          result = result.replace(urlRegex, `[${url}](${normalizedUrl})`);
        }
      }
    });

    return result;
  }
}

function normalizeMath(content) {
  return content
    .replace(/\\\[(.*?)\\\]/gs, (_, expr) => `$$${expr}$$`)
    .replace(/\\\((.*?)\\\)/gs, (_, expr) => `$${expr}$`);
}



export const ChatMessage = ({ message, ...props }) => {
  const isUser = message.sender === "user";
  const [time, setTime] = useState(null);

  // Initialize URL detector
  const urlDetector = useMemo(() => new URLDetector(), []);

  // Process message content with URL detection
  const processedMessage = useMemo(() => {
    if (isUser) {
      // For user messages, just return as is or optionally convert URLs
      return message.message;
    } else {
      // For AI messages, convert URLs to markdown and normalize math
      const withUrls = urlDetector.convertUrlsToMarkdown(message.message);
      return normalizeMath(withUrls);
    }
  }, [message.message, isUser, urlDetector]);

  useEffect(() => {
    if (typeof message?.created_at === "string") {
      setTime(new Date(message.created_at));
    } else {
      setTime(message.created_at);
    }
  }, [message]);

  return (
    <div>
      <div
        className={cn(
          "flex gap-4 ",
          isUser ? "justify-end" : "justify-start flex-col md:flex-row"
        )}
      >
        {!isUser && (
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <GraduationCap size={20} className="text-white" />
          </div>
        )}

        <div
          className={cn(
            "relative rounded-2xl px-5 py-3.5 word-break break-words transition-all duration-200",
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md rounded-br-none md:max-w-[80%] hover:shadow-lg"
              : "bg-whitetext-gray-800 w-full"
          )}
        >
          <div className="markdown">
            {isUser ? (
              processedMessage
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  // Custom link component with styling
                  a: LinkRenderer,
                  // Optional: Style other elements
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
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
                {processedMessage}
              </ReactMarkdown>
            )}
          </div>
          {isUser && (
            <p
              className={cn(
                "text-xs mt-1.5 opacity-80",
                isUser ? "text-white" : "text-gray-500"
              )}
            >
              {time?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>

        {isUser && (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <User className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};
