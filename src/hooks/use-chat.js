//create custom hook to handle chat data
import { useState } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

export function useChat() {
  const [messages, setMessages] = useState();
  const [fetchStatus, setFetchStatus] = useState("loading");
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [mode, setMode] = useState("literature");
  const [chatbotId, setChatbotId] = useState(null);
  

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

  return {
    messages,
    setMessages,
    fetchStatus,
    setFetchStatus,
    isLoading,
    setIsLoading,
    activeTab,
    setActiveTab,
    mode,
    setMode,
    chatbotId,
    setChatbotId,
    sendMessage,
  };
}
