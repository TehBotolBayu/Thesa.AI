"use client";
import { ChatMessage } from "@/components/ChatMessage";
import AcademicPaperTable from "@/components/paperTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { systemPrompt } from "@/const/ai";
import {
  BookOpen,
  CircleCheck,
  Columns4,
  FileTextIcon,
  GraduationCap,
  Loader,
  NewspaperIcon,
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
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/authProvider";
import { useDocData } from "@/hooks/use-document";
import { useChat } from "@/hooks/use-chat";
import ColumnManagemet from "./components/columnManagemet";
import { useColumn } from "@/hooks/use-column";
import StepProgressBar from "../progressBar";
import { useReview } from "@/hooks/use-review";
import Step1Criteria from "./components/systematicReviewSteps/Step1Criteria";
import Step2Extraction from "./components/systematicReviewSteps/Step2Extraction";
import Step3Evaluation from "./components/systematicReviewSteps/Step3Evaluation";
import Step4Synthesis from "./components/systematicReviewSteps/Step4Synthesis";

const LiveDemoEditor = dynamic(
  () => import("@/app/editor/components/DemoEditor"),
  { ssr: false }
);

const ChatInterface = () => {
  const { user } = useAuth();

  const pathname = usePathname();
  const id = pathname.split("/").pop();
  const router = useRouter();
  const {
    messages,
    setMessages,
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
  } = useChat();

  const {
    currentStep,
    setCurrentStep,
    reviewStatus,
    setReviewStatus,
    isProcessing: reviewProcessing,
    setIsProcessing: setReviewProcessing,
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
  } = useReview();

  const [inputMessage, setInputMessage] = useState("");
  const [isShowManageColumn, setIsShowManageColumn] = useState(false);
  const [viewMode, setViewMode] = useState("rich-text");
  const [leftWidth, setLeftWidth] = useState(300); // starting width
  const [rightWidth, setrightWidth] = useState(400);
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const chatContainerRef = useRef(null);
  const openProp = useSidebar();
  const newChatBotId = useRef("");
  const [sortBy, setSortBy] = useState("");
  const {
    saveDocument,
    docData,
    setDocData,
    isSaving,
    isExporting,
    setIsExporting,
    isSaved,
    setIsSaved,
    oldDocData,
    setOldDocData,
    fetchDocData,
  } = useDocData();

  const {
    additionalColumn,
    paperColumnValuesMap,
    addPaperColumnValues,
    initData: initColumnData,
    postNewColumn,
    triggerFetching,
  } = useColumn();

  useEffect(() => {
    const id = pathname.split("/").pop();
    if (id) setChatbotId(id);
  }, [pathname]);

  useEffect(() => {
    let currStep = 1;
    console.log(
      "additionalColumn: ",
      JSON.stringify(additionalColumn, null, 2)
    );
    if (
      additionalColumn.find(
        (column) =>
          column.step === "extract_data" || column.step === "evaluation"
      )
    ) {
      currStep = 2;
      const extractDataColumn = additionalColumn.filter(
        (column) => column.step === "extract_data"
      );
      // const extractDataColumnValues = paperColumnValuesMap.filter(column => column.step === "extract_data");

      let extractionData = paperData.map((paper) => {
        return {
          paperId: paper.id,
          success: true,
          data: Object.values(paperColumnValuesMap[paper.id])
            .map((item) => ({
              label: item.label,
              value: item.value,
              step: item.step,
            }))
            .filter((item) => item.step === "extract_data"),
        };
      });

      console.log("extractionData: ", JSON.stringify(extractionData, null, 2));

      console.log(
        "extractDataColumn: ",
        JSON.stringify(extractDataColumn, null, 2)
      );
      setExtractionResults(extractionData);
      setExtractionProgress({
        total: extractDataColumn.length,
        processed: extractDataColumn.length,
        failed: 0,
      });

      if (additionalColumn.find((column) => column.step === "evaluation")) {
        let evaluationData = paperData.map((paper) => {
          return {
            title: paper.title,
            paperId: paper.id,
            success: true,
            // overallScore: '',
            // keywordCount: '',
            // inclusionScores: [],
            // exclusionScores: [],
            data: Object.values(paperColumnValuesMap[paper.id])
              .map((item) => ({
                label: item.label,
                value: item.value,
                step: item.step,
              }))
              .filter(
                (item) =>
                  item.step !== "extract_data" &&
                  item.step !== null &&
                  item.step !== ""
              ),
            // ...(Object.values(paperColumnValuesMap[paper.id]).map(item => ({
            //   label: item.label,
            //   value: item.value,
            //   step: item.step
            // }))).filter(item => item.step === "evaluation")
          };
        });

        console.log(
          "evaluationData: ",
          JSON.stringify(evaluationData, null, 2)
        );

        setEvaluationResults(evaluationData);
        setEvaluationProgress({
          total: evaluationData.length,
          processed: evaluationData.length,
          failed: 0,
        });

        currStep = 3;
      }
    }
    setCurrentStep(currStep);
  }, [additionalColumn]);

  useEffect(() => {
    (async () => {
    if (currentStep === 3) {
      const response = await fetch("/api/document?chatbot_id=" + chatbotId);
        const data = await response.json();
        console.log('documentm data: ', JSON.stringify(data, null, 2));
        setSynthesisReport(data[0].content);
      } 
    })();
  }, [currentStep]);

  const {
    deletePapers,
    paperData,
    setPaperData,
    selectedPapers,
    setSelectedPapers,
  } = usePaperData();

  useEffect(() => {
    if (isSaved) {
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    }
  }, [isSaved]);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const isValid = await fetchDocData(id, user);
      if (isValid) {
        setChatbotId(id);
        initChatData(id);
        fetchPaperData(id);
        fetchReviewCriteria(id);
      }
    })();
  }, [id, user]);

  const fetchPaperData = async (id) => {
    const response = await fetch("/api/papers/chatbot/" + id);
    const paperData = await response.json();
    initColumnData(id, paperData);
    setPaperData(paperData);
  };

  const initChatData = async (documentId) => {
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const childRef = useRef();

  const rejectChanges = () => {
    setDocData(oldDocData ? oldDocData.replace(/<<EOT|EOT/g, "").trim() : "");
    setOldDocData("");
    setViewMode("rich-text");
  };

  const acceptChanges = () => {
    setOldDocData("");
    setViewMode("rich-text");
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      message: inputMessage,
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

    if (user && (!chatbotId || (!newChatBotId.current && !id))) {
      console.log("buat baru");
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
        setChatbotId(data.id);
        window.history.pushState(undefined, "Title", `/c/${data.id}`);
      } catch (err) {
        console.error("Error posting message:", err.message);
        return null;
      }
    } else if (!user) {
      router.push("/login");
      return;
    }

    await sendMessage({
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
        chatbotId: chatbotId || newChatBotId.current,
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
          body: JSON.stringify({
            ...body,
            docData: docData ? docData.replace(/<<EOT|EOT/g, "").trim() : "",
          }),
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
          setOldDocData(
            docData ? docData.replace(/<<EOT|EOT/g, "").trim() : ""
          );
          setDocData(aiData?.data?.content.replace(/<<EOT|EOT/g, "").trim());
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

        await sendMessage({
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
        throw new Error("No ai response");
      }
    } catch (error) {
      console.error("Error in chat flow:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!sortBy) return;
    let sortedPaperData = [...paperData];
    if (sortBy === "relevance_ascending") {
      sortedPaperData.sort((a, b) => a.score - b.score);
    } else {
      sortedPaperData.sort((a, b) => b.score - a.score);
    }
    setPaperData(sortedPaperData);
  }, [sortBy]);

  const handlePostNewColumn = async (columnName, columnInstruction) => {
    setIsShowManageColumn(false);
    await postNewColumn(chatbotId, columnName, columnInstruction);
  };

  // Systematic Review Handlers
  const handleGenerateCriteria = async () => {
    try {
      setReviewProcessing(true);
      setReviewStatus("in_progress");

      const response = await fetch("/api/systematic-review/generate-criteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatHistory: messages,
          userQuery: null, // Can be used for additional context if needed
          paperCount: paperData.length,
          chatbot_id: chatbotId,
        }),
      });

      if (!response.ok) {
        console.error("Failed to generate criteria");
      }

      const result = await response.json();
      setCriteria(result?.data || {});
    } catch (error) {
      console.error("Error generating criteria:", error);
      alert("Failed to generate criteria. Please try again.");
    } finally {
      setReviewProcessing(false);
    }
  };

  const handleConfirmCriteria = () => {
    setCurrentStep(2);
  };

  const handleExtractData = async () => {
    try {
      setReviewProcessing(true);
      setExtractionProgress({
        total: paperData.length,
        processed: 0,
        failed: 0,
      });

      const response = await fetch("/api/systematic-review/extract-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          papers: paperData,
          criteria,
          chatbotId,
        }),
      });

      if (!response.ok) {
        console.error("Failed to extract criteria");
      }

      const result = await response.json();
      setExtractionResults(result.data);

      const failedCount = result.data.filter((r) => !r.success).length;
      setExtractionProgress({
        total: paperData.length,
        processed: paperData.length,
        failed: failedCount,
      });

      // Refresh column data
      await fetchPaperData(chatbotId);
      setActiveTab("review");
    } catch (error) {
      console.error("Error extracting data:", error);
      alert("Failed to extract data. Please try again.");
    } finally {
      setReviewProcessing(false);
      setActiveTab("review");
    }
  };

  const handleEvaluatePapers = async () => {
    try {
      setReviewProcessing(true);
      setEvaluationProgress({
        total: paperData.length,
        processed: 0,
        failed: 0,
      });

      const response = await fetch("/api/systematic-review/evaluate-papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          papers: paperData,
          extractions: extractionResults,
          criteria,
          chatbotId,
        }),
      });

      if (!response.ok) {
        console.error("Failed to evaluate criteria");
      }

      const result = await response.json();

      console.log("new generated evaluation results: ", JSON.stringify(result.dxata, null, 2));
      setEvaluationResults(result.data);

      const failedCount = result.data.filter((r) => !r.success).length;
      setEvaluationProgress({
        total: paperData.length,
        processed: paperData.length,
        failed: failedCount,
      });

      // Refresh column data
      await fetchPaperData(chatbotId);

      setActiveTab("review");
    } catch (error) {
      console.error("Error evaluating papers:", error);
      alert("Failed to evaluate papers. Please try again.");
    } finally {
      setReviewProcessing(false);
      setActiveTab("review");
    }
  };

  const handleSynthesize = async () => {
    try {
      setSynthesisLoading(true);

      const response = await fetch("/api/systematic-review/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          papers: paperData,
          evaluations: evaluationResults,
          extractions: extractionResults,
          criteria,
          chatbot_id: chatbotId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to synthesize results");
      }

      const result = await response.json();
      setSynthesisReport(result.data.synthesis);
      setReviewStatus("completed");
      setActiveTab("review");
    } catch (error) {
      console.error("Error synthesizing results:", error);
      alert("Failed to synthesize results. Please try again.");
    } finally {
      setSynthesisLoading(false);
      setActiveTab("review");
    }
  };

  const handleApplyToEditor = () => {
    setDocData(synthesisReport);
    setActiveTab("editor");
  };

  const fetchReviewCriteria = async (chatbotId) => {
    const response = await fetch(
      `/api/systematic-review/generate-criteria/${chatbotId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      setCriteria({});
      return;
    }

    const result = await response.json();

    console.log("Review criteria: ", JSON.stringify(result, null, 2));

    setCriteria(result?.data || {});
  };

  const handleExportDoc = () => {
    convertMarkdownToDocx(docData, "document.docx");
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
    }, 1000);
    return true;
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
            Search Results
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
          <button
            onClick={() => setActiveTab("review")}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "review"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <BookOpen size={16} />
            Systematic Review
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
                <div className="flex gap-2 pt-2 flex-wrap">
                  <Button
                    className="bg-white text-black border-gray-300 border"
                    onClick={deletePapers}
                  >
                    <Trash size={16} />
                    Delete Papers
                  </Button>
                  <div className="w-42">
                    <DropdownSelect
                      placeholder="Sort By"
                      setSelectedValue={setSortBy}
                      selectionList={[
                        {
                          value: "relevance_ascending",
                          label: "From Most Relevant",
                        },
                        {
                          value: "relevance_descending",
                          label: "From Least Relevant",
                        },
                      ]}
                    />
                  </div>
                  <Button
                    className="bg-white text-black border-gray-300 border"
                    onClick={() => setIsShowManageColumn(true)}
                  >
                    <Columns4 size={16} />
                    Manage Columns
                  </Button>
                </div>
              </div>

              {isShowManageColumn ? (
                <ColumnManagemet
                  setIsShowManageColumn={setIsShowManageColumn}
                  columns={additionalColumn}
                  handlePostNewColumn={handlePostNewColumn}
                />
              ) : (
                <AcademicPaperTable
                  tableData={paperData}
                  selectedPapers={selectedPapers}
                  setSelectedPapers={setSelectedPapers}
                  paperColumnValuesMap={paperColumnValuesMap}
                  additionalColumn={additionalColumn}
                  triggerFetching={triggerFetching}
                  addPaperColumnValues={addPaperColumnValues}
                />
              )}
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
                <div>
                  <Button
                    className="bg-white text-black border-gray-300 border w-fit"
                    onClick={() => handleExportDoc()}
                  >
                    {isExporting ? (
                      <Loader className="animate-spin" size={16} />
                    ) : (
                      <FileTextIcon size={16} />
                    )}
                    Export to doc
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
                markdown={
                  docData
                    ? docData.replace(/<<EOT|EOT/g, "").trim()
                    : "" || "Write something..."
                }
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

        {/* second Panel */}
        {activeTab === "review" && (
          <>
            <div
              className="bg-chatbg h-full overflow-auto"
              style={{ width: leftWidth }}
            >
              <div className="bg-gray-100 px-6 py-4 ">
                <StepProgressBar
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                  reviewStatus={reviewStatus}
                />
              </div>

              <div>
                {currentStep === 1 && (
                  <Step1Criteria
                    criteria={criteria}
                    setCriteria={setCriteria}
                    onGenerate={handleGenerateCriteria}
                    onConfirm={handleConfirmCriteria}
                    isProcessing={reviewProcessing}
                    paperData={paperData}
                  />
                )}
                {currentStep === 2 && (
                  <Step2Extraction
                    extractionProgress={extractionProgress}
                    extractionResults={extractionResults}
                    onExtract={handleExtractData}
                    onContinue={() => setCurrentStep(3)}
                    onBack={() => setCurrentStep(1)}
                    isProcessing={reviewProcessing}
                    paperData={paperData}
                  />
                )}
                {currentStep === 3 && (
                  <Step3Evaluation
                    evaluationProgress={evaluationProgress}
                    evaluationResults={evaluationResults}
                    onEvaluate={handleEvaluatePapers}
                    onContinue={() => setCurrentStep(4)}
                    onBack={() => setCurrentStep(2)}
                    isProcessing={reviewProcessing}
                    paperData={paperData}
                    criteria={criteria}
                    columns={additionalColumn.filter(
                      (column) =>
                        column.step !== "extract_data" &&
                        column.step !== "" &&
                        column.step !== null
                    )}
                  />
                )}
                {currentStep === 4 && (
                  <Step4Synthesis
                    synthesisReport={synthesisReport}
                    onSynthesize={handleSynthesize}
                    onApplyToEditor={handleApplyToEditor}
                    onBack={() => setCurrentStep(3)}
                    isProcessing={reviewProcessing}
                    synthesisLoading={synthesisLoading}
                  />
                )}
              </div>
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
                  <DropdownSelect
                    placeholder="Select a Mode"
                    setSelectedValue={setMode}
                    selectionList={[
                      { value: "literature", label: "Literature Review Mode" },
                      { value: "writer", label: "Writer Mode" },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
