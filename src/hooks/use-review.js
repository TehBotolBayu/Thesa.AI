//create custom hook to handle chat data
import { useState } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

export function useReview() {
  
  const [currentStep, setCurrentStep] = useState(1);
  return { currentStep, setCurrentStep };
}
