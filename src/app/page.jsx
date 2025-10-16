"use client";
import { ChatMessage } from "@/components/ChatMessage";
import AcademicPaperTable from "@/components/paperTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { systemPrompt } from "@/const/ai";
import {
  CircleCheck,
  DownloadIcon,
  GraduationCap,
  Loader,
  Plus,
  Save,
  Send,
  Trash,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import DropdownSelect from "@/components/ui/dropdownSelect";
import { useSidebar } from "@/components/ui/sidebar";
import { usePaperData } from "@/hooks/usePaperData";
import { FileText, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, redirect } from "next/navigation";
import { useAuth } from "@/components/authProvider";
import { useDocData } from "@/hooks/use-document";

const LiveDemoEditor = dynamic(
  () => import("@/app/editor/components/DemoEditor"),
  { ssr: false }
);

const ResizablePanels = () => {
  const { user, isLoading: authLoading, profile } = useAuth();

  const pathname = usePathname();
  const id = pathname.split("/").pop();

  const [viewMode, setViewMode] = useState("rich-text");

  const [leftWidth, setLeftWidth] = useState(300); // starting width
  const [rightWidth, setrightWidth] = useState(400);
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const router = useRouter();
  const [messages, setMessages] = useState();
  const [fetchStatus, setFetchStatus] = useState("loading");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatContainerRef = useRef(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [mode, setMode] = useState("literature");
  const [chatbotId, setChatbotId] = useState(null);
  const openProp = useSidebar();

  const {
    saveDocument,
    docData,
    setDocData,
    isSaving,
    setIsSaving,
    isSaved,
    setIsSaved,
    oldDocData,
    setOldDocData,
  } = useDocData();

  useEffect(() => {
    const id = pathname.split("/").pop();
    if (id) setChatbotId(id);
  }, [pathname]);

  useEffect(() => {
    if (isSaved) {
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    }
  }, [isSaved]);

  const {
    deletePapers,
    paperData,
    setPaperData,
    selectedPapers,
    setSelectedPapers,
  } = usePaperData();

  const fetchDocData = async (chatbotid) => {
    const response = await fetch("/api/chatbot/" + chatbotid);
    const data = await response.json();
    if (data.created_by !== user.id) {
      redirect("/");
    }
    setDocData(data.document);
    return true;
  };

  const fetchPaperData = async (id) => {
    const response = await fetch("/api/papers/chatbot/" + id);
    const paperData = await response.json();
    setPaperData(paperData);
  };

  const initChatData = async (documentId) => {
    if (localStorage.getItem("thesa-firstMessage")) {
      handleSendMessage(
        localStorage.getItem("thesa-firstMessage").slice(1, -1),
        documentId
      );
      localStorage.removeItem("thesa-firstMessage");

      setFetchStatus("success");
      return;
    }
    try {
      const response = await fetch("/api/conversations/" + documentId);
      const conversationdata = await response.json();

      if (response) {
        setMessages(conversationdata);
        setFetchStatus("success");
      } else {
        setFetchStatus("error");
      }
    } catch (error) {
      setFetchStatus("error");
    }
  };

  useEffect(() => {
    (() => {
      const containerRect = containerRef.current.getBoundingClientRect();

      if (openProp.state == "expanded") {
        setrightWidth(200);
        setLeftWidth("50%");
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
      //
      if (openProp.state == "expanded") {
        if (newWidth + 256 >= containerRect.width - 656) return;
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

  const newChatBotId = useRef('');

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

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

    if (user && (!chatbotId || newChatBotId.current)) {
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
        // bug ai not answering after user send message
        newChatBotId.current = data.id;
        window.history.pushState(undefined, "Title", `/c/${data.id}`);
      } catch (err) {
        console.error("Error posting message:", err.message);
        return null;
      }
    } else {
      router.push("/login");
      return;
    }

    const result = await sendMessage({
      chatbot_id: chatbotId || newChatBotId.current,
      message: inputMessage || message,
      sender: "user",
      session_id: Date.now().toString(),
    });

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
          setOldDocData(docData);
          setDocData(aiData?.data?.content);
          setViewMode("diff");
          aiMessage = {
            id: Date.now().toString() + "-ai",
            message: aiData?.data?.response,
            sender: "assistant",
            created_at: new Date(),
          };
          setActiveTab("editor");
        } else {
          aiMessage = {
            id: Date.now().toString() + "-ai",
            message: aiData?.data?.finalAnswer,
            sender: "assistant",
            created_at: new Date(),
          };
        }

        const result = await sendMessage({
          chatbot_id: chatbotId || newChatBotId.current,
          message: aiMessage.message,
          sender: "assistant",
          session_id: Date.now().toString(),
        });

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

  async function sendMessage({ chatbot_id, message, sender, session_id }) {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatbot_id,
          message,
          sender,
          session_id,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send message");
      }

      const data = await res.json();
      return data; // new conversation row
    } catch (err) {
      console.error("Error posting message:", err.message);
      return null;
    }
  }

  const childRef = useRef();

  const rejectChanges = () => {
    setDocData(oldDocData);
    setOldDocData("");
    setViewMode("rich-text");
  };

  const acceptChanges = () => {
    setOldDocData("");
    setViewMode("rich-text");
  };

  return (
    <div className="h-[calc(100vh-46px)]">
      <nav className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
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
              <div className="bg-gray-100 px-6 py-4 ">
                <h1 className="text-xl font-bold ">
                  Academic Paper Information
                </h1>
                <div className="flex gap-2 pt-2">
                  <Button
                    className="bg-white text-black border-gray-300 border"
                    onClick={deletePapers}
                  >
                    <Trash size={16} />
                    Delete Papers
                  </Button>
                  {/* <Button className="bg-white text-black border-gray-300 border">
                    <Plus size={16} />
                    Add Column
                  </Button>
                  <Button className="bg-white text-black border-gray-300 border">
                    <DownloadIcon size={16} />
                    Export
                  </Button> */}
                </div>
              </div>
              <AcademicPaperTable
                tableData={paperData}
                selectedPapers={selectedPapers}
                setSelectedPapers={setSelectedPapers}
              />
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
              <div className="bg-gray-100 py-2 px-6 flex flex-row gap-4 w-full items-center">
                <div>
                  <Button
                    className="bg-white text-black border-gray-300 border w-fit"
                    onClick={() => saveDocument(chatbotId)}
                  >
                    {isSaving ? (
                      <Loader className="animate-spin" size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    Save Documents
                  </Button>
                </div>
                <div className=" text-black flex flex-row gap-2 items-center">
                  {isSaved && (
                    <>
                      <CircleCheck className="text-green-500" />
                      Saved
                    </>
                  )}
                </div>
              </div>
              <LiveDemoEditor
                markdown={docData || "Write something..."}
                diffMarkdown={oldDocData}
                setDocData={setDocData}
                modeState={viewMode}
                ref={childRef}
              />
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
          className={`flex-1 h-full overflow-auto`}
          style={{ width: rightWidth }}

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

                    {oldDocData && (
                      <div className="mx-15 flex flex-row gap-2 -mt-6">
                        <Button
                          className="bg-red-500 hover:bg-red-500/90 text-white"
                          onClick={() => {
                            rejectChanges();
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          className="bg-primarylight hover:bg-primarylight/90 text-white"
                          onClick={() => {
                            acceptChanges();
                          }}
                        >
                          Accept
                        </Button>
                      </div>
                    )}

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
