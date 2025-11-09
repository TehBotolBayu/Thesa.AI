"use client";
import { ChatMessage } from "@/components/ChatMessage";
import AcademicPaperTable from "@/components/paperTable/academicPaperTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { systemPrompt } from "@/const/ai";
import {
  BookOpen,
  CircleCheck,
  Columns4,
  FileText,
  FileTextIcon,
  GraduationCap,
  Loader,
  Save,
  Search,
  Send,
  Trash,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import DropdownSelect from "@/components/ui/dropdownSelect";
import { useSidebar } from "@/components/ui/sidebar";
import { usePaperData } from "@/hooks/usePaperData";
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
import { convertMarkdownToDocx } from "@/lib/document/exporter";

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
    setAdditionalColumn,
  } = useColumn();

  useEffect(() => {
    const id = pathname.split("/").pop();
    if (id) setChatbotId(id);
  }, [pathname]);

  useEffect(() => {
    let currStep = 1;
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

        if (!data || data.length === 0 || !data[0].content) return;
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
        try {
          fetchReviewCriteria(id);
        } catch (error) {
          console.error("Error fetching review criteria: ", error);
        }
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
          message: aiMessage.message || "Here are the results of paper search",
          sender: "assistant",
          session_id: Date.now().toString(),
        });

        if (aiData?.data?.toolResult) {
          fetchPaperData(chatbotId || newChatBotId.current);
          // if (paperData && paperData.length > 0) {
          //   setPaperData((prev) => [...prev, ...aiData.data.toolResult]);
          // } else {
          //   fetchPaperData()
          //   setPaperData(aiData.data.toolResult);
          // }
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
    await postNewColumn(
      chatbotId || newChatBotId.current,
      columnName,
      columnInstruction
    );
  };

  // Systematic Review Handlers
  const handleGenerateCriteria = async () => {
    try {
      setReviewProcessing(true);
      setReviewStatus("in_progress");

      const userMessage = messages
        .filter((msg) => msg.sender === "user")
        .map((msg) => ({ userMessage: msg.message }));
      const msgString = JSON.stringify(userMessage, null, 2);

      // return;

      const response = await fetch("/api/systematic-review/generate-criteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatHistory: msgString,
          userQuery: null, // Can be used for additional context if needed
          paperCount: paperData.length,
          chatbot_id: chatbotId,
        }),
      });

      if (!response.ok) {
        console.error("Failed to generate criteria: ", response.error);
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

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000/api/socket");
    ws.onopen = () => {
      ws.send("Hello, WebSocket!");
    };
    ws.onmessage = (event) => {};
    ws.onclose = () => {};
    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="h-[calc(100vh-47px)]">
      <nav className="bg-white border-b border-gray-200 px-6 shadow-sm">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("research")}
            className={`py-3 px-4 border-b-2 font-semibold text-sm flex items-center gap-2 transition-all duration-200 ${
              activeTab === "research"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
            }`}
          >
            <Search size={18} />
            Search Results
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={`py-3 px-4 border-b-2 font-semibold text-sm flex items-center gap-2 transition-all duration-200 ${
              activeTab === "editor"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
            }`}
          >
            <FileText size={18} />
            Document Editor
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={`py-3 px-4 border-b-2 font-semibold text-sm flex items-center gap-2 transition-all duration-200 ${
              activeTab === "review"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
            }`}
          >
            <BookOpen size={18} />
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
              className="bg-chatbg overflow-auto hide-scrollbar "
              style={{ width: leftWidth }}
            >
              <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-6 py-5 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Academic Paper Information
                </h1>
                <div className="flex gap-3 pt-2 flex-wrap">
                  <Button
                    variant="outline"
                    className="bg-white"
                    onClick={deletePapers}
                  >
                    <Trash size={16} />
                    Delete Papers
                  </Button>
                  <div className="w-fit">
                    <DropdownSelect
                      placeholder="Sort By"
                      setSelectedValue={setSortBy}
                      selectionList={[
                        {
                          value: "relevance_descending",
                          label: "From Most Relevant",
                        },
                        {
                          value: "relevance_ascending",
                          label: "From Least Relevant",
                        },
                      ]}
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="bg-white"
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
                  setColumns={setAdditionalColumn}
                />
              ) : (
                <div className="max-w-6xl mx-auto p-4 ">
                  <AcademicPaperTable
                    tableData={paperData}
                    selectedPapers={selectedPapers}
                    setSelectedPapers={setSelectedPapers}
                    paperColumnValuesMap={paperColumnValuesMap}
                    additionalColumn={additionalColumn}
                    triggerFetching={triggerFetching}
                    addPaperColumnValues={addPaperColumnValues}
                  />
                </div>
              )}
              {/* <divv */}
            </div>
            {/* Divider */}
            <div
              role="separator"
              onMouseDown={handleMouseDown}
              className="w-1 bg-gray-400 cursor-col-resize hover:bg-gray-600"
            ></div>
          </>
        )}

        {/* third Panel */}
        {activeTab === "editor" && (
          <>
            <div
              className="bg-chatbg h-full overflow-auto overflow-x-auto"
              style={{ width: leftWidth, whiteSpace: "nowrap" }}
            >
              <div className="bg-gradient-to-r from-blue-50 to-blue-50 py-4 px-6 flex flex-row gap-3 w-full items-center border-b border-gray-200">
                <div>
                  <Button
                    variant="outline"
                    className="bg-white w-fit"
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
                    variant="outline"
                    className="bg-white w-fit"
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
                <div className="text-gray-900 flex flex-row gap-2 items-center">
                  {isSaved && (
                    <>
                      <CircleCheck className="text-green-500" />
                      <span className="font-semibold text-green-700">
                        Saved
                      </span>
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
              role="separator"
              onMouseDown={handleMouseDown}
              className="w-1 bg-gray-400 cursor-col-resize hover:bg-gray-600"
            ></div>
          </>
        )}

        {/* second Panel */}
        {activeTab === "review" && (
          <>
            <div
              className="bg-chatbg h-full w-full overflow-auto overflow-x-auto"
              style={{ width: leftWidth }}
            >
              <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-6 py-5 border-b border-gray-200">
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
              role="separator"
              onMouseDown={handleMouseDown}
              className="w-1 bg-gray-400 cursor-col-resize hover:bg-gray-600"
            ></div>
          </>
        )}

        {/* first Panel */}
        <div
          className={`flex-1 h-full overflow-auto`}
          style={{ width: rightWidth }}
        >
          <div
            className={`w-full h-full relative flex flex-col  overflow-hidden py-8 md:px-16 px-4  max-w-5xl mx-auto ${
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
                <div className="flex flex-col justify-center items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <GraduationCap size={32} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-600">
                    How can I help you?
                  </h1>
                  <p className="text-gray-600 text-center max-w-md">
                    Ask me anything about your research, or let me help you with
                    literature reviews and document writing.
                  </p>
                </div>
              )}

              {messages && messages.length > 0 && (
                <div className="relative">
                  <div className="relative z-0 space-y-6 ">
                    {messages?.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}

                    {oldDocData && (
                      <div className="mx-15 flex flex-row gap-3 -mt-6">
                        <Button
                          className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md"
                          onClick={() => {
                            rejectChanges();
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md"
                          onClick={() => {
                            acceptChanges();
                          }}
                        >
                          Accept
                        </Button>
                      </div>
                    )}

                    {isLoading && (
                      <div className="flex justify-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                          <GraduationCap size={20} className="text-white" />
                        </div>
                        <div className="px-5 py-3.5 rounded-2xl rounded-tl-none bg-white border border-gray-200 shadow-md">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <span
                                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                                style={{ animationDelay: "0s" }}
                              ></span>
                              <span
                                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></span>
                              <span
                                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                                style={{ animationDelay: "0.4s" }}
                              ></span>
                            </div>
                            <span className="text-gray-600 text-sm ml-2">
                              Generating answer...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Input Area - FIXED: Removed sticky positioning that can cause issues */}
            <div className="chatinputarea w-full  ">
              <div className="border-t  rounded-xl bg-white backdrop-blur-sm container mx-auto p-4 shadow-lg">
                <div className="flex gap-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white cursor-pointer"
                  >
                    <Send className="h-5 w-5" />
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
