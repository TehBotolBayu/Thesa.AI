  import { Button } from "@/components/ui/button";
import { Loader, ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function Step3Evaluation({ 
  evaluationProgress,
  evaluationResults,
  onEvaluate,
  onContinue,
  onBack,
  isProcessing,
  paperData,
  criteria,
  columns,
}) {
  const isComplete = evaluationProgress.processed === evaluationProgress.total && evaluationProgress.total > 0;
  const hasStarted = evaluationProgress.total > 0;

  const [criteriaLegend, setCriteriaLegend] = useState([]);

  const getScoreColor = (score) => {
    if(!score){
      score = 0;
    }else if (typeof score !== 'number') {
      // use regex to extract number from string
      const number = score.match(/\d+/)[0];
      score = parseInt(number);
    }
    if (score >= 7) return "text-green-600 font-semibold";
    if (score >= 4) return "text-yellow-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  useEffect(() => {
    
    let legend ={}
    
    if(!criteria || criteria.length === 0 || !criteria.inclusionCriteria || !criteria.exclusionCriteria) {
      return;
    }
    const inclusionCriteria = criteria.inclusionCriteria.map(item => ({
      label: item,
      color: "green"
    }));
    const exclusionCriteria = criteria.exclusionCriteria.map(item => ({
      label: item,
      color: "red"
    }));
    legend = {
      inclusionCriteria: inclusionCriteria,
      exclusionCriteria: exclusionCriteria
    }
    
    setCriteriaLegend(legend);
  }, [columns, criteria]);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-orange-900 mb-2">
          Step 3: Evaluate Papers Against Criteria
        </h2>
        <p className="text-sm text-orange-700">
          AI will evaluate each paper against your research question, count keywords, and score 
          each inclusion/exclusion criterion (0-10 scale) to determine paper relevance.
        </p>
      </div>

      {!hasStarted ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-gray-600 text-center">
            Ready to evaluate {paperData?.length || 0} papers against your criteria.
          </p>
          <Button
            onClick={onEvaluate}
            disabled={isProcessing || !paperData || paperData.length === 0}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isProcessing ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Evaluating Papers...
              </>
            ) : (
              "Start Paper Evaluation"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Evaluation Progress
              </span>
              <span className="text-sm text-gray-600">
                {evaluationProgress.processed} / {evaluationProgress.total} papers
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-orange-600 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${(evaluationProgress.processed / evaluationProgress.total) * 100}%`
                }}
              />
            </div>
            {evaluationProgress.failed > 0 && (
              <p className="text-sm text-red-600 mt-2">
                {evaluationProgress.failed} papers failed to evaluate
              </p>
            )}
          </div>

          {/* Results Table */}
          {evaluationResults.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Evaluation Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="p-2 text-left font-semibold sticky left-0 bg-gray-100 z-10">Paper</th>
                      {/* <th className="p-2 text-center font-semibold">Overall Score</th>
                      <th className="p-2 text-center font-semibold">Keywords</th>
                      {criteria?.inclusionCriteria?.map((criterion, idx) => (
                        <th key={`inc-${idx}`} className="p-2 text-center font-semibold min-w-[100px]">
                          Inclusion {idx + 1}
                        </th>
                      ))}
                      {criteria?.exclusionCriteria?.map((criterion, idx) => (
                        <th key={`exc-${idx}`} className="p-2 text-center font-semibold min-w-[100px]">
                          Exclusion {idx + 1}
                        </th>
                      ))} */}
                      {columns.map(item => (
                        <th key={`${item.label}-${item.step}`} className="p-2 text-center font-semibold min-w-[100px]">
                          {item.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {evaluationResults.filter(r => r.success).map((result, index) => {
                      const paper = paperData.find(p => p.id === result.paperId);
                      const data = result.data;
                      
                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 sticky left-0 bg-white hover:bg-gray-50 max-w-[200px]">
                            <div className="truncate" title={paper?.title}>
                              {paper?.title || `Paper ${result.paperId}`}
                            </div>
                          </td>
                          {
                            data.map((item, idx) => (
                              <td key={`inc-score-${idx}`} className={`p-2 text-center ${getScoreColor(item.value )}`}>
                                {item.value}
                              </td>
                            ))
                          }
                          {/* <td className={`p-2 text-center ${getScoreColor(data.overallScore)}`}>
                            {data.overallScore}/10
                          </td>
                          <td className="p-2 text-center">
                            {data.keywordCount}
                          </td>
                          {data.inclusionScores?.map((score, idx) => (
                            <td key={`inc-score-${idx}`} className={`p-2 text-center ${getScoreColor(score)}`}>
                              {score}/10
                            </td>
                          ))}
                          {data.exclusionScores?.map((score, idx) => (
                            <td key={`exc-score-${idx}`} className={`p-2 text-center ${getScoreColor(10 - score)}`}>
                              {score}/10
                            </td>
                          ))} */}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Criteria Legend */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Criteria Legend:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {criteriaLegend?.inclusionCriteria?.map((criterion, idx) => (
                    <div key={`inc-legend-${idx}`} className="text-xs">
                      <span className="font-semibold text-green-700">Inclusion {idx + 1}:</span> {criterion.label}
                    </div>
                  ))}
                  {criteriaLegend?.exclusionCriteria?.map((criterion, idx) => (
                    <div key={`exc-legend-${idx}`} className="text-xs">
                      <span className="font-semibold text-red-700">Exclusion {idx + 1}:</span> {criterion.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Summary Statistics */}
          {/* {isComplete && evaluationResults.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Evaluation Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-2xl font-semibold text-green-600">
                    {evaluationResults.filter(r => r.success && r.data.overallScore >= 7).length}
                  </div>
                  <div className="text-xs text-gray-600">High Score (7-10)</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded">
                  <div className="text-2xl font-semibold text-yellow-600">
                    {evaluationResults.filter(r => r.success && r.data.overallScore >= 4 && r.data.overallScore < 7).length}
                  </div>
                  <div className="text-xs text-gray-600">Medium Score (4-6)</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded">
                  <div className="text-2xl font-semibold text-red-600">
                    {evaluationResults.filter(r => r.success && r.data.overallScore < 4).length}
                  </div>
                  <div className="text-xs text-gray-600">Low Score (0-3)</div>
                </div>
              </div>
            </div>
          )} */}

          {/* Action Buttons */}
          <div className="flex justify-between gap-4 pt-4 border-t">
            <Button
              onClick={onBack}
              disabled={isProcessing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Back to Extraction
            </Button>
            {isComplete && (
              <Button
                onClick={onContinue}
                disabled={isProcessing}
                className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
              >
                Continue to Synthesis
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}