"use client";

import { validatePhoneNumber } from "@/lib/general/inpuValidator";
import { submitUserIdentitiy } from "@/services/userIdentity.service";
import { Loader } from "lucide-react";
import { useState } from "react";

const ChatbotEmailForm = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isError, setIsError] = useState("");
  const [isSuccess, setIsSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneChange = (e) => {
    const number = e.target.value;
    if (!validatePhoneNumber(number)) {
      return;
    }
    setPhone(number);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setIsError("");
    setIsSuccess("");
    const body = {
      email,
      phone,
    };
    try {
      const result = await submitUserIdentitiy(body);
      if (result) {
        setIsSuccess("Your Information has been submitted successfully");
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setIsError("Failed to submit email, please try again");
      setIsSuccess("");
    }
  };

  return (
    <div className=" shadow-2xl w-full max-w-sm flex flex-col border border-white rounded-md">
      <div className="text-center bg-primary p-4 ">
        <h2 className="text-xl font-bold text-white mb-2">Need more help?</h2>
        <p className="text-white ">Fill out your details below and an admin will contact you shortly</p>
      </div>
      <div className="bg-chatbg p-8 ">
        {/* Header */}

        {/* Form */}
        <div className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Email Address
            </label>
            <input
              value={email}
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Phone Input */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Phone Number
            </label>
            <input
              value={phone}
              id="phone"
              type="text"
              placeholder="Enter your phone number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none hover:border-gray-400"
              onChange={(e) => handlePhoneChange(e)}
            />
          </div>

          {/* Error Message */}
          {!!isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Failed to submit
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{isError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {!!isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {isSuccess}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="cursor-pointer w-full bg-primary hover:bg-primary/70 disabled:bg-primary/40 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
          >
            <Loader
              className={`animate-spin mr-2 h-5 w-5 ${
                isLoading ? "inline-block" : "hidden"
              }`}
            />
            {isLoading ? "Submitting..." : "Get contacted"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotEmailForm;
