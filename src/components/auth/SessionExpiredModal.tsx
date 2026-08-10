"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getUserData, clearUserData } from "@/utils/userContext";

export default function SessionExpiredModal() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function show() {
      setVisible(true);
    }

    function hide() {
      setVisible(false);
    }

    if (pathname === "/signin") {
      return;
    }

    // Listen for programmatic session expiry and restore events
    window.addEventListener("session:expired", show as EventListener);
    window.addEventListener("session:restored", hide as EventListener);

    // Poll localStorage expiry every 5 seconds
    const poll = setInterval(() => {
      if (pathname === "/signin") {
        return;
      }

      const user = getUserData();
      // Only show the modal if the user key is absent AND there is no
      // recent restoration event. This avoids false positives during
      // quick cross-tab updates when the user signs back in.
      if (!user) {
        setVisible(true);
      } else if (user.expiresAt && Date.now() > user.expiresAt) {
        // Clear stored user and show
        clearUserData();
        setVisible(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener("session:expired", show as EventListener);
      window.removeEventListener("session:restored", hide as EventListener);
      clearInterval(poll);
    };
  }, []);

  if (!visible || pathname === "/signin") return null;

  const handleSignIn = () => {
    try {
      clearUserData();
    } catch (e) {
      // ignore
    }
    router.replace("/signin");
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md mx-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Session expired</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Your session has expired. Please sign in again to continue.</p>
        <button
          onClick={handleSignIn}
          className="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
