"use client";

import ChatInterface from "@/components/chatInterface";
import dynamic from "next/dynamic";

const LiveDemoEditor = dynamic(
  () => import("@/app/editor/components/DemoEditor"),
  { ssr: false }
);

const ResizablePanels = () => {

  return <ChatInterface />;
};

export default ResizablePanels;
