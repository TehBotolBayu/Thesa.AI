"use client";
import { LinkRenderer } from "@/lib/general/parser";
import { normalizeMath, URLDetector } from "@/lib/markdownUtil/parser";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import { GraduationCap, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import MarkdownParser from "./ui/markdownParser";

// URL Detection utility

export const ChatMessage = ({ message, ...props }) => {
  const isUser = message.sender === "user";
  const [time, setTime] = useState(null);

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
            "relative rounded-2xl px-5 py-3.5 word-break break-words transition-all duration-200 min-w-0",
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md rounded-br-none md:max-w-[80%] hover:shadow-lg"
              : "bg-whitetext-gray-800 w-full"
          )}
        >
          <div className="markdown w-full min-w-0">
            {isUser ? (
              message.message
            ) : (
              <MarkdownParser content={message.message} />
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
