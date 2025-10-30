"use client";

import { useState } from "react";

export function useDocData() {
  const [docData, setDocData] = useState('');
  const [oldDocData, setOldDocData] = useState('');
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

  const fetchDocData = async (chatbotid, user) => {
    const response = await fetch("/api/chatbot/" + chatbotid);
    const data = await response.json();
    if (data.created_by !== user.id) {
      redirect("/");
    }
    setDocData(data.document);
    return true;
  };

  return {
    saveDocument,
    docData,
    setDocData,
    isSaving,
    isSaved,
    setIsSaved,
    oldDocData, setOldDocData,
    fetchDocData,
  };
}
