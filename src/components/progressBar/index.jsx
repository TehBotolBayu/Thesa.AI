import { useState } from "react";

export default function StepProgressBar({ 
  currentStep: propsCurrentStep, 
  setCurrentStep: propsSetCurrentStep,
  reviewStatus = "not_started" 
}) {
  const [localCurrentStep, setLocalCurrentStep] = useState(1);
  
  // Use props if provided, otherwise use local state
  const currentStep = propsCurrentStep !== undefined ? propsCurrentStep : localCurrentStep;
  const setCurrentStep = propsSetCurrentStep || setLocalCurrentStep;

  const steps = [
    { id: 1, label: "Defining Criteria" },
    { id: 2, label: "Data Extraction" },
    { id: 3, label: "Evaluation" },
    { id: 4, label: "Synthesis" },
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepId) => {
    setCurrentStep(stepId);
  };

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Systematic Literature Review</h1>
      {(reviewStatus === "in_progress" || reviewStatus === "not_started") && (
        <>
          <div className="relative my-6">
            {/* Background Line */}
            <div className="absolute top-5 left-0 w-full h-2 bg-gray-200 rounded-full"></div>

            {/* Active Line with Gradient */}
            <div
              className="absolute top-5 left-0 h-2 bg-gradient-to-r from-blue-500 via-blue-500 to-pink-500 rounded-full transition-all duration-500 ease-in-out shadow-md"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
            ></div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Dot */}
                  <button
                    onClick={() => goToStep(step.id)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      currentStep >= step.id
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50 scale-110 ring-4 ring-blue-100"
                        : "bg-white text-gray-400 border-2 border-gray-300 hover:border-blue-300"
                    } hover:scale-125 focus:outline-none focus:ring-4 focus:ring-blue-200`}
                  >
                    {currentStep > step.id ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </button>

                  {/* Label */}
                  <span
                    className={`mt-3 w-8 text-center text-sm font-medium transition-colors duration-300 ${
                      currentStep >= step.id ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
                currentStep === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 hover:shadow-lg shadow-md"
              }`}
            >
              Previous
            </button>

            <button
              onClick={nextStep}
              disabled={currentStep === steps.length}
              className={`px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
                currentStep === steps.length
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-600 text-white hover:from-blue-700 hover:to-blue-700 hover:shadow-lg shadow-md"
              }`}
            >
              {currentStep === steps.length ? "Completed" : "Next"}
            </button>
          </div>
          {reviewStatus === "in_progress" && (
            <p className="text-sm text-gray-600 mt-2">Review in progress...</p>
          )}
          {reviewStatus === "not_started" && (
            <p className="text-sm text-gray-600 mt-2">Start by generating criteria in Step 1</p>
          )}
        </>
      )}
      {reviewStatus === "completed" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
          <p className="text-green-800 font-semibold">✓ Review Completed</p>
          <p className="text-sm text-green-700 mt-1">
            All steps have been completed. You can view the synthesis report in Step 4.
          </p>
        </div>
      )}
      {/* Progress Bar */}
    </>
  );
}
