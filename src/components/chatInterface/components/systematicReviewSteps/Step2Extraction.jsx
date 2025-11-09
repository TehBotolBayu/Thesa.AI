import SystematicLiteratureReviewPaperTable from "@/components/paperTable/systematiceLiteratureReview";
import { Button } from "@/components/ui/button";
import { Loader, ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function Step2Extraction({
  extractionProgress,
  extractionResults,
  onExtract,
  onContinue,
  onBack,
  isProcessing,
  paperData,
}) {
  const [hasStarted, setHasStarted] = useState(false);
  const isComplete =
    extractionProgress.processed === extractionProgress.total &&
    extractionProgress.total > 0;

  useEffect(() => {
    if (extractionResults.length > 0) {
      setHasStarted(true);
    }
  }, [extractionResults]);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-green-900 mb-2">
          Step 2: Extract Key Data Points
        </h2>
        <p className="text-sm text-green-700">
          AI will analyze each paper and extract: objective, method, result,
          limitation, optimization, technical implementation, and applicability.
        </p>
      </div>

      {!hasStarted ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-gray-600 text-center">
            Ready to extract data from {paperData?.length || 0} papers.
          </p>
          <Button
            onClick={onExtract}
            disabled={isProcessing || !paperData || paperData.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isProcessing ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Extracting Data...
              </>
            ) : (
              "Start Data Extraction"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Extraction Progress
              </span>
              <span className="text-sm text-gray-600">
                {extractionProgress.processed} / {extractionProgress.total}{" "}
                papers
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    (extractionProgress.processed / extractionProgress.total) *
                    100
                  }%`,
                }}
              />
            </div>
            {extractionProgress.failed > 0 && (
              <p className="text-sm text-red-600 mt-2">
                {extractionProgress.failed} papers failed to process
              </p>
            )}
          </div>

          {/* Results Preview */}
          {extractionResults.length > 0 && (  
              <SystematicLiteratureReviewPaperTable
                tableRowData={extractionResults}
                paperData={paperData}
              />
          )}

          {/* Action Buttons */}
          <div className="flex justify-between gap-4 pt-4 border-t">
            <Button
              onClick={onBack}
              disabled={isProcessing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Back to Criteria
            </Button>
            {isComplete && (
              <Button
                onClick={onContinue}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                Continue to Evaluation
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
