"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getUserData, clearUserData } from "@/utils/userContext";

export default function SessionExpiredModal() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function show() {
      setVisible(true);
    }

    if (pathname === "/signin") {
      return;
    }

    // Listen for programmatic session expiry events
    window.addEventListener("session:expired", show as EventListener);

    // Poll localStorage expiry every 5 seconds
    const poll = setInterval(() => {
      if (pathname === "/signin") {
        return;
      }

      const user = getUserData();
      if (!user) {
        // If getUserData returned null, session expired or cleared
        setVisible(true);
      } else if (user.expiresAt && Date.now() > user.expiresAt) {
        // Clear stored user and show
        clearUserData();
        setVisible(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener("session:expired", show as EventListener);
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (!visible || pathname === "/signin") return;

    // After showing the overlay, navigate back to sign-in after a brief pause
    const t = setTimeout(() => {
      // Ensure storage is cleared and navigate
      try {
        clearUserData();
      } catch (e) {
        // ignore
      }
      window.location.replace('/signin');
    }, 2200);

    return () => clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md mx-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Session expired</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Your session has expired. You will be redirected back to the login page.</p>
        <div className="flex items-center justify-center">
          <svg className="w-8 h-8 mr-2 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"></path>
          </svg>
          <span className="text-sm text-gray-700 dark:text-gray-300">Redirecting...</span>
        </div>
      </div>
    </div>
  );
}
