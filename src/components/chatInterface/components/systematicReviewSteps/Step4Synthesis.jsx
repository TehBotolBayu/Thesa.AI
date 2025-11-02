import { Button } from "@/components/ui/button";
import {
  Loader,
  RefreshCw,
  Download,
  FileText,
  ChevronLeft,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { LinkRenderer } from "@/lib/general/parser";
import { ChatMessage } from "@/components/ChatMessage";
import { convertMarkdownToDocx } from "@/lib/document/exporter";

export default function Step4Synthesis({
  synthesisReport,
  onSynthesize,
  onApplyToEditor,
  onExport,
  onBack,
  isProcessing,
  synthesisLoading,
}) {
  const hasSynthesis = synthesisReport && synthesisReport.trim().length > 0;

  const handleExport = () => {
    convertMarkdownToDocx(synthesisReport, "synthesis.docx");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-purple-900 mb-2">
          Step 4: Synthesize Results
        </h2>
        <p className="text-sm text-purple-700">
          AI will analyze all papers, extractions, and evaluations to identify
          patterns, contradictions, relationships, and generate a comprehensive
          synthesis report.
        </p>
      </div>

      {!hasSynthesis ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-gray-600 text-center">
            Ready to generate a comprehensive synthesis report from all analyzed
            papers.
          </p>
          <Button
            onClick={onSynthesize}
            disabled={isProcessing || synthesisLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {synthesisLoading ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Generating Synthesis...
              </>
            ) : (
              "Generate Synthesis Report"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Synthesis Report Display */}
          <ChatMessage
            message={{
              message: synthesisReport,
              sender: "assistant",
              created_at: new Date().toISOString(),
            }}
            isUser={false}
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button
              onClick={onBack}
              disabled={isProcessing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Back to Evaluation
            </Button>
            <Button
              onClick={onSynthesize}
              disabled={synthesisLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Regenerate Synthesis
            </Button>
            <Button
              onClick={onApplyToEditor}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <FileText size={16} />
              Apply to Document Editor
            </Button>
            <Button
              onClick={handleExport}
              disabled={isProcessing}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <Download size={16} />
              Export Report To Docx
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
