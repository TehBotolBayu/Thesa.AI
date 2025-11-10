"use client";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, X } from "lucide-react";


const Modal = ({
  isOpen,
  title,
  content,
  onClose,
  titleColor = "black",
  buttonHandlerA = () => {},
  buttonTextA = "",
  buttonHandlerB = () => {},
  buttonTextB = "",
  modalType = "success",
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // only true after client-side mount
  }, []);

  return (
    <>
    {isOpen && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in-0 zoom-in-95 duration-300 border border-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all duration-200"
        >
          <X className="w-5 h-5 cursor-pointer" />
        </button>

        {/* Modal Content */}
        <div className="text-center">
          {modalType === "success" ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-5 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                {title}
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {content}
              </p>
              <Button
                className="cursor-pointer w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={buttonHandlerA}
              >
                {buttonTextA}
              </Button>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-400 to-rose-500 rounded-full mb-5 shadow-lg">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                {title}
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {content}
              </p>
              <Button
                className="cursor-pointer w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={buttonHandlerA}
              >
                {buttonTextA}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
    )}
    </>
  );
};

export default Modal;
