"use client";
import { ChatMessage } from "@/components/ChatMessage";
import AcademicPaperTable from "@/components/paperTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { systemPrompt } from "@/const/ai";
import { GraduationCap, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const ResizablePanels = () => {
  const [leftWidth, setLeftWidth] = useState(300); // starting width
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const [paperData, setPaperData] = useState();

  const handleMouseDown = () => {
    isDragging.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left; // distance from container left
    if (newWidth > 100 && newWidth < containerRect.width - 100) {
      setLeftWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const router = useRouter();
  const [messages, setMessages] = useState();
  const [fetchStatus, setFetchStatus] = useState("loading");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // 👇 ref for scrolling - only use one ref for consistency
  const chatContainerRef = useRef(null);

  useEffect(() => {
    setFetchStatus("loaded");
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      const container = chatContainerRef.current;
      if (container) {
        // Use requestAnimationFrame to ensure DOM updates are complete
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
      }
    };

    // Small delay to ensure content is rendered
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  useEffect(() => {
    if (paperData && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setLeftWidth(containerRect.width * 0.7); // left = 70%, right = 30%
    } else {
      setLeftWidth("100%");
    }
  }, [paperData]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      sender: "user",
      created_at: new Date(),
    };

    if (messages && messages.length > 0) {
      setMessages((prev) => [...prev, userMessage]);
    } else {
      setMessages([userMessage]);
    }
    setInputMessage("");
    setIsLoading(true);

    try {
      // prepare serialized messages
      let serialized;
      if (messages && messages.length > 0) {
        serialized = [...messages, userMessage].map((m) => ({
          type: m.sender === "user" ? "user" : "assistant",
          content: m.message,
        }));
      } else {
        serialized = [{ type: "user", content: userMessage.message }];
      }

      const body = {
        serialized: [{ type: "system", content: systemPrompt }, ...serialized],
        message: userMessage.message,
      };

      const aiResponseRes = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let aiData = await aiResponseRes.json();
      console.log("aiData: ", JSON.stringify(aiData, null, 2));
      if (aiData?.data) {
        const aiMessage = {
          id: Date.now().toString() + "-ai",
          message: aiData?.data?.finalAnswer,
          sender: "assistant",
          created_at: new Date(),
        };
        if (aiData?.data?.toolResult) {
          console.log("Setting paper data: ", aiData?.data?.toolResult);
          setPaperData(aiData?.data?.toolResult);
        }
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw Error("No ai response");
      }
    } catch (error) {
      console.error("Error in chat flow:", error);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex w-full h-screen border"
      style={{ userSelect: isDragging.current ? "none" : "auto" }}
    >
      {/* Left Panel */}
      <div
        className="bg-gray-100 h-full overflow-auto"
        style={{ width: paperData ? leftWidth : "100%" }}
      >
        <div
          className={`w-full bg-chatbg  relative flex flex-col h-screen  overflow-hidden py-8 px-16  ${
            !(messages && messages.length > 0) && "justify-center"
          }`}
        >
          <div
            ref={chatContainerRef}
            className={`scrollbar-hide overflow-y-scroll container mx-auto px-4 py-6 
              ${
                messages && messages.length > 0
                  ? "flex-1"
                  : " h-fit flex items-center flex-col justify-center"
              }
              `}
            style={{
              scrollBehavior: "smooth",
              overscrollBehavior: "contain",
            }}
          >
            {(!messages || messages.length <= 0) && (
              <div className="flex flex-row justify-center items-center ">
                <h1 className="text-2xl font-semibold text-primary">
                  How can I help you?
                </h1>
              </div>
            )}

            {messages && messages.length > 0 && (
              <div className="relative">
                <div className="relative z-0 space-y-6 ">
                  {messages?.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex-shrink-0 w-8 h-8 mr-4 rounded-full flex items-center justify-center bg-chatbg">
                        <GraduationCap size={24} />
                      </div>
                      <div className="px-4 italic animate-customPulse">
                        Generating answer...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Input Area - FIXED: Removed sticky positioning that can cause issues */}
          <div className="chatinputarea  ">
            <div className="border-t  bg-secondary backdrop-blur-sm rounded-md container mx-auto px-4 py-4 max-w-4xl">
              <div className="flex gap-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything..."
                  className="flex-1 bg-primary-input"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="gap-2 bg-primarylight text-white cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:block"> Send </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}

      {/* Right Panel */}
      {paperData && (
        <>
          <div
            onMouseDown={handleMouseDown}
            className="w-1 bg-gray-400 cursor-col-resize hover:bg-gray-600"
          ></div>
          <div className="flex-1 bg-white h-full overflow-auto">
            <div className="bg-primarylight px-6 py-4">
              <h1 className="text-xl font-bold text-white">
                Academic Paper Information
              </h1>
            </div>
            <AcademicPaperTable tableData={paperData} />
          </div>
        </>
      )}
    </div>
  );
};

export default ResizablePanels;
