"use client";
import * as React from "react"

export function useEditor() {
  const [docData, setDocData] = React.useState();

  return { docData, setDocData };
}
