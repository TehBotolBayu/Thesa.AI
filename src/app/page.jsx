"use client";
import { ChatMessage } from "@/components/ChatMessage";
import AcademicPaperTable from "@/components/paperTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { systemPrompt } from "@/const/ai";
import { GraduationCap, Pencil, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useSidebar } from "@/components/ui/sidebar";
import { useEditor } from "@/hooks/use-editor";
import { FileText, MessageSquare, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { Select } from "radix-ui";
import { SelectTrigger, SelectValue } from "@radix-ui/react-select";
import DropdownSelect from "@/components/ui/dropdownSelect";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/components/authProvider";
const LiveDemoEditor = dynamic(
  () => import("@/app/editor/components/DemoEditor"),
  { ssr: false }
);

const ResizablePanels = () => {
  const pathname = usePathname();
  const { user, isLoading: authLoading, profile } = useAuth();

  const [leftWidth, setLeftWidth] = useState(300); // starting width
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const [paperData, setPaperData] = useState();
  const router = useRouter();
  const [messages, setMessages] = useState();
  const [fetchStatus, setFetchStatus] = useState("loading");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // 👇 ref for scrolling - only use one ref for consistency
  const chatContainerRef = useRef(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [selectedChat, setSelectedChat] = useState(0);
  const [mode, setMode] = useState("literature");
  const [chatbotId, setChatbotId] = useState(0);
  const { docData, setDocData } = useEditor();
  const openProp = useSidebar();

  useEffect(() => {
    (() => {
      const containerRect = containerRef.current.getBoundingClientRect(); 
      if (openProp.state == "expanded") {
        setLeftWidth((p) => p - 256);
      } else { 
        setLeftWidth((p) => p + 256);
      }
    })();
  }, [openProp]);

  useEffect(() => {
    if (paperData && paperData.length > 0) {
      setActiveTab("research");
    }
  }, [paperData]);

  useEffect(() => {
    if (docData && docData.length > 0) {
      setActiveTab("editor");
    }
  }, [docData]);

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
    if ((paperData || docData) && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setLeftWidth(containerRect.width * 0.5); // left = 70%, right = 30%
    } else {
      setLeftWidth("100%");
    }
  }, [paperData, docData]);

  const handleMouseDown = () => {
    isDragging.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left; // distance from container left
    if (newWidth > 100 && newWidth < containerRect.width - 400) { 
      if (openProp.state == "expanded") {
        setLeftWidth((p) => p - 256);
      }
      setLeftWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (user) {
      localStorage.setItem("thesa-firstMessage", JSON.stringify(inputMessage));
      // create new chat
      try {
        const response = await fetch("/api/chatbot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: inputMessage,
            description: "",
            system_prompt: "",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error:", errorData.error || "Unknown error");
          return;
        }

        const data = await response.json();
        router.push(`/c/${data.id}`);

        return data;
        // goes to the c/id page
        // save the message to the local storage
      } catch (err) {
        console.error("Error posting message:", err.message);
        return null;
      }
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      message: inputMessage || message,
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

      let aiResponseRes = null;
      if (mode === "literature") {
        aiResponseRes = await fetch("/api/ai-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        aiResponseRes = await fetch("/api/ai-writer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, docData }),
        });
      }
      let aiData = null;
      if (aiResponseRes.ok) {
        aiData = await aiResponseRes.json();
      } else {
        throw new Error(aiResponseRes.error);
      } 
      if (aiData?.data) {
        let aiMessage = null;
        if (mode === "writer") {
          setDocData(aiData?.data?.content);
          aiMessage = {
            id: Date.now().toString() + "-ai",
            message: aiData?.data?.response,
            sender: "assistant",
            created_at: new Date(),
          };
        } else {
          aiMessage = {
            id: Date.now().toString() + "-ai",
            message: aiData?.data?.finalAnswer,
            sender: "assistant",
            created_at: new Date(),
          };
        }

        if (aiData?.data?.toolResult) {
          if (paperData && paperData.length > 0) {
            setPaperData((prev) => [...prev, ...aiData.data.toolResult]);
          } else {
            setPaperData(aiData.data.toolResult);
          }
        }
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw Error("No ai response");
      }
    } catch (error) { 
      console.error("Error in chat flow:", error);
    }
    setIsLoading(false);

    return;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-46px)] pt-4">
      <nav className="bg-white border-b border-gray-200 px-6 flex flex-row justify-between items-center">
        <div className="flex space-x-8 ">
          <button
            onClick={() => setActiveTab("research")}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "research"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Search size={16} />
            Research Results
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "editor"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText size={16} />
            Document Editor
          </button>
        </div>
        <div className="flex space-x-8 ">
            
          {
            !user &&
          <a
          href="/login"
          >
            <Button className="bg-primarylight text-white">

            Log In
            </Button>
          </a>
          }
        </div>
      </nav>
      <div
        ref={containerRef}
        className="flex w-full w-max-screen border h-full"
        style={{ userSelect: isDragging.current ? "none" : "auto" }}
      >
        {/* second Panel */}
        {activeTab === "research" && (
          <>
            <div
              className="bg-chatbg h-full overflow-auto"
              style={{ width: leftWidth }}
            >
              {/* <LiveDemoEditor markdown={docData || "Write something..."} /> */}
              <div className="bg-primarylight px-6 py-4 ">
                <h1 className="text-xl font-bold text-white">
                  Academic Paper Information
                </h1>
              </div>
              <AcademicPaperTable tableData={paperData} />
              {/* <divv */}
            </div>
            {/* Divider */}
            <div
              onMouseDown={handleMouseDown}
              className="w-1 bg-gray-400 cursor-col-resize hover:bg-gray-600"
            ></div>
          </>
        )}

        {/* third Panel */}
        {activeTab === "editor" && (
          <>
            <div
              className="bg-chatbg h-full overflow-auto"
              style={{ width: leftWidth }}
            >
              <div className="bg-gray-100"></div>
              <LiveDemoEditor markdown={docData || "Write something..."} />
              {/* <divv */}
            </div>
            {/* Divider */}
            <div
              onMouseDown={handleMouseDown}
              className="w-1 bg-gray-400 cursor-col-resize hover:bg-gray-600"
            ></div>
          </>
        )}

        {/* first Panel */}
        <div
          className="flex-1 h-full overflow-auto"
          // style={{ width: paperData || docData ? leftWidth : "100%" }}
        >
          <div
            className={`w-full bg-chatbg h-full relative flex flex-col  overflow-hidden py-8 md:px-16 px-4  max-w-5xl mx-auto ${
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
                    How can I help you? {user ? user.email : 'wawa'}
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
            <div className="chatinputarea  w-full ">
              <div className="border-t  bg-secondary backdrop-blur-sm rounded-md container mx-auto p-4 ">
                <div className="flex gap-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything..."
                    className="flex-1 bg-primary-input"
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
                {/* create dropdown for selecting the chat */}
                <div className="max-w-64 w-fit mt-4">
                  <DropdownSelect setSelectedValue={setMode} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResizablePanels;
