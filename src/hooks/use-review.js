//create custom hook to handle systematic review data
import { useState } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

export function useReview() {
  const [currentStep, setCurrentStep] = useState(1);
  const [reviewStatus, setReviewStatus] = useState("not_started"); // not_started, in_progress, completed
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Step 1: Criteria
  const [criteria, setCriteria] = useState({
    researchQuestion: "",
    hypothesis: "",
    keywords: [],
    inclusionCriteria: [],
    exclusionCriteria: [],
    relevancyThreshold: 0.7,
  });
  
  // Step 2: Extraction Results
  const [extractionProgress, setExtractionProgress] = useState({
    total: 0,
    processed: 0,
    failed: 0,
  });
  const [extractionResults, setExtractionResults] = useState([]);
  
  // Step 3: Evaluation Results
  const [evaluationProgress, setEvaluationProgress] = useState({
    total: 0,
    processed: 0,
    failed: 0,
  });
  const [evaluationResults, setEvaluationResults] = useState([]);
  
  // Step 4: Synthesis
  const [synthesisReport, setSynthesisReport] = useState("");
  const [synthesisLoading, setSynthesisLoading] = useState(false);
  
  // Reset all state
  const resetReview = () => {
    setCurrentStep(1);
    setReviewStatus("not_started");
    setIsProcessing(false);
    setCriteria({
      researchQuestion: "",
      hypothesis: "",
      keywords: [],
      inclusionCriteria: [],
      exclusionCriteria: [],
      relevancyThreshold: 0.7,
    });
    setExtractionProgress({ total: 0, processed: 0, failed: 0 });
    setExtractionResults([]);
    setEvaluationProgress({ total: 0, processed: 0, failed: 0 });
    setEvaluationResults([]);
    setSynthesisReport("");
    setSynthesisLoading(false);
  };
  
  return {
    currentStep,
    setCurrentStep,
    reviewStatus,
    setReviewStatus,
    isProcessing,
    setIsProcessing,
    criteria,
    setCriteria,
    extractionProgress,
    setExtractionProgress,
    extractionResults,
    setExtractionResults,
    evaluationProgress,
    setEvaluationProgress,
    evaluationResults,
    setEvaluationResults,
    synthesisReport,
    setSynthesisReport,
    synthesisLoading,
    setSynthesisLoading,
    resetReview,
  };
}
