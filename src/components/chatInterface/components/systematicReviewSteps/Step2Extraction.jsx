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
  paperData 
}) {
  const [hasStarted, setHasStarted] = useState(false);
  const isComplete = extractionProgress.processed === extractionProgress.total && extractionProgress.total > 0;

  useEffect(() => {
    if(extractionResults.length > 0) {
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
          AI will analyze each paper and extract: objective, method, result, limitation, 
          optimization, technical implementation, and applicability.
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
                {extractionProgress.processed} / {extractionProgress.total} papers
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${(extractionProgress.processed / extractionProgress.total) * 100}%`
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
            <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
              <h3 className="font-semibold text-gray-800 mb-3">Extracted Data Preview</h3>
              <div className="space-y-3">
                {extractionResults.filter(r => r.success).slice(0, 5).map((result, index) => {
                  const paper = paperData.find(p => p.id === result.paperId);
                  return (
                    <div key={index} className="border-l-4 border-green-500 pl-3 py-2">
                      <h4 className="font-medium text-sm text-gray-800 mb-1">
                        {paper?.title || `Paper ${result.paperId}`}
                      </h4>
                      <div className="text-xs text-gray-600 space-y-1">

                        { result.data && result.data.map((item, index) => (
                          <p key={index}><strong>{item.label}:</strong> {item.value?.substring(0, 100)}...</p>
                        )) }
                      </div>
                    </div>
                  );
                })}
              </div>
              {extractionResults.filter(r => r.success).length > 5 && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  ... and {extractionResults.filter(r => r.success).length - 5} more papers
                </p>
              )}
            </div>
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

