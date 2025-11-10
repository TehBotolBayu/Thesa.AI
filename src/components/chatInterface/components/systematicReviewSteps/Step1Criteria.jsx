import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, RefreshCw, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function Step1Criteria({ 
  criteria, 
  setCriteria, 
  onGenerate, 
  onConfirm, 
  isProcessing,
  paperData 
}) {
  const [editMode, setEditMode] = useState(false);
  const [hasGeneratedCriteria, setHasGeneratedCriteria] = useState(false);

  const handleKeywordAdd = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      setCriteria(prev => ({
        ...prev,
        keywords: [...prev.keywords, e.target.value.trim()]
      }));
      e.target.value = "";
    }
  };

  const handleKeywordRemove = (index) => {
    setCriteria(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const handleCriteriaAdd = (type, value) => {
    if (value.trim()) {
      setCriteria(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
    }
  };

  const handleCriteriaRemove = (type, index) => {
    setCriteria(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    
    const hasGeneratedCriteria = criteria && criteria.researchQuestion;
    setHasGeneratedCriteria(hasGeneratedCriteria);
  }, [criteria]);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Step 1: Define Research Criteria
        </h2>
        <p className="text-sm text-blue-700">
          AI will analyze your research conversation and generate a research question, 
          hypothesis, keywords, and inclusion/exclusion criteria for reviewing {paperData?.length || 0} papers. 
          You can review and edit them before proceeding.
        </p>
      </div>

      {!hasGeneratedCriteria ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-gray-600 text-center">
            Click the button below to generate research criteria based on your conversation context.
          </p>
          <Button
            onClick={onGenerate}
            disabled={isProcessing || !paperData || paperData.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isProcessing ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Generating Criteria...
              </>
            ) : (
              "Generate Criteria"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Research Question */}
          <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Research Question
            </label>
            <textarea
              value={criteria.researchQuestion}
              onChange={(e) => setCriteria(prev => ({ ...prev, researchQuestion: e.target.value }))}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="What is the main research question?"
            />
          </div>

          {/* Hypothesis */}
          {/* <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Hypothesis
            </label>
            <textarea
              value={criteria.hypothesis}
              onChange={(e) => setCriteria(prev => ({ ...prev, hypothesis: e.target.value }))}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="What hypothesis will be tested?"
            />
          </div> */}

          {/* Keywords */}
          <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Keywords
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {criteria.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {keyword}
                  <button
                    onClick={() => handleKeywordRemove(index)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <Input
              placeholder="Add keyword and press Enter"
              onKeyPress={handleKeywordAdd}
              className="w-full"
            />
          </div>

          {/* Relevancy Threshold */}
          {/* <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Relevancy Score Threshold: {criteria.relevancyThreshold.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={criteria.relevancyThreshold}
              onChange={(e) => setCriteria(prev => ({ ...prev, relevancyThreshold: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Less Strict (0.0)</span>
              <span>More Strict (1.0)</span>
            </div>
          </div> */}

          {/* Inclusion Criteria */}
          <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Inclusion Criteria
            </label>
            <ul className="space-y-2 mb-3">
              {criteria.inclusionCriteria.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 font-semibold">✓</span>
                  <span className="flex-1">{item}</span>
                  <button
                    onClick={() => handleCriteriaRemove('inclusionCriteria', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <Input
              placeholder="Add inclusion criterion and press Enter"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleCriteriaAdd('inclusionCriteria', e.target.value);
                  e.target.value = "";
                }
              }}
            />
          </div>

          {/* Exclusion Criteria */}
          <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Exclusion Criteria
            </label>
            <ul className="space-y-2 mb-3">
              {criteria.exclusionCriteria.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-red-600 font-semibold">×</span>
                  <span className="flex-1">{item}</span>
                  <button
                    onClick={() => handleCriteriaRemove('exclusionCriteria', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <Input
              placeholder="Add exclusion criterion and press Enter"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleCriteriaAdd('exclusionCriteria', e.target.value);
                  e.target.value = "";
                }
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-4 pt-4 border-t">
            <Button
              onClick={onGenerate}
              disabled={isProcessing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Regenerate
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              Confirm & Continue
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

