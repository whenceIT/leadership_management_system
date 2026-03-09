"use client";
import React, { useState, useEffect } from "react";

const InternetStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState("");

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNotificationText("Internet connection restored");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNotificationText("Internet connection lost");
      setShowNotification(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {/* Status Indicator */}
      <div
        className={`fixed bottom-4 left-4 z-[99999] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          isOnline 
            ? "bg-green-500 text-white" 
            : "bg-red-500 text-white"
        } ${showNotification ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
          {isOnline ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            {notificationText}
          </span>
          <span className="text-xs opacity-90">
            {isOnline 
              ? "You are now connected to the internet" 
              : "You are currently offline"}
          </span>
        </div>
      </div>

      {/* Persistent Status Indicator (always visible when offline) */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-[99999] flex items-center gap-3 px-4 py-3 bg-red-500 text-white rounded-lg shadow-lg">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Internet connection lost</span>
            <span className="text-xs opacity-90">You are currently offline</span>
          </div>
        </div>
      )}
    </>
  );
};

export default InternetStatus;
