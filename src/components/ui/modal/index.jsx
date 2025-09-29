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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5 cursor-pointer" />
        </button>

        {/* Modal Content */}
        <div className="text-center">
          {modalType === "success" ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {title}
              </h2>
              <p className="text-gray-600 mb-6">
                {content}
              </p>
              <Button
                className="cursor-pointer w-full bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/80 hover:to-secondary/70 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg"
                onClick={buttonHandlerA}
              >
                {buttonTextA}
              </Button>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {title}
              </h2>
              <p className="text-gray-600 mb-6">
                {content}
              </p>
              <Button
                className="cursor-pointer w-full bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/80 hover:to-destructive/70 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg"
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
