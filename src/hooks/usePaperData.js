"use client";

import * as React from "react";
import { useState } from "react";

const MOBILE_BREAKPOINT = 768;

export function usePaperData() {
  const [selectedPapers, setSelectedPapers] = useState([]);

  const [paperData, setPaperData] = useState();

  const deletePapers = async () => {
    if(!selectedPapers.length) return;
    const body = {
      ids: selectedPapers,
    };

    const response = await fetch("/api/papers/bulk", {
      method: "DELETE",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to delete papers");
    }

    setPaperData(paperData.filter((paper) => !selectedPapers.includes(paper.id)));
  };

  return {
    deletePapers,
    paperData,
    setPaperData,
    selectedPapers,
    setSelectedPapers,
  };
}
