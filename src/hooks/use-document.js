"use client";

import { useState } from "react";

export function useDocData() {
  const [docData, setDocData] = useState();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const saveDocument = async (chatbotid) => {
    
    setIsSaving(true);
    const body = {
      document: docData,
    };
    
    // call api to save doc here
    const response = await fetch("/api/chatbot/" + chatbotid, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setIsSaving(false);
      throw new Error("Failed to save document");
    }

    setIsSaving(false);
    setIsSaved(true);

    return true;
  };

  return {
    saveDocument,
    docData,
    setDocData,
    isSaving,
    isSaved,
    setIsSaved,
  };
}
