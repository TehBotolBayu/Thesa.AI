"use client";

import dynamic from "next/dynamic";

import ChatInterface from "@/components/chatInterface";

const LiveDemoEditor = dynamic(
  () => import("@/app/editor/components/DemoEditor"),
  { ssr: false }
);

const ResizablePanels = () => {
  return <ChatInterface />;
};

export default ResizablePanels;
