"use client";
import React, { useState, useEffect } from "react";
import { LoaderSpinner } from "@/components/ui/loader/PageLoader";

interface ApiLoaderProps {
  isLoading: boolean;
  text?: string;
}

const ApiLoader: React.FC<ApiLoaderProps> = ({ 
  isLoading, 
  text = "Loading data..." 
}) => {
  const [showLoader, setShowLoader] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  // Track network requests
  useEffect(() => {
    const originalFetch = window.fetch;
    
    const fetchProxy = async (url: RequestInfo | URL, options?: RequestInit) => {
      setRequestCount(prev => prev + 1);
      
      try {
        const response = await originalFetch(url, options);
        setRequestCount(prev => prev - 1);
        return response;
      } catch (error) {
        setRequestCount(prev => prev - 1);
        throw error;
      }
    };
    
    window.fetch = fetchProxy as any;
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    if (isLoading || requestCount > 0) {
      setShowLoader(true);
    } else {
      setShowLoader(false);
    }
  }, [isLoading, requestCount]);

  if (!showLoader) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[99999] flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 animate-slide-up">
      <LoaderSpinner size="sm" />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {text}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {requestCount > 0 
            ? `Loading ${requestCount} ${requestCount === 1 ? 'resource' : 'resources'}...`
            : 'Please wait while we populate the data...'}
        </span>
      </div>
    </div>
  );
};

export default ApiLoader;
