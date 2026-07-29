"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { LoaderSpinner } from "@/components/ui/loader/PageLoader";

interface ApiLoaderProps {
  isLoading: boolean;
  text?: string;
}

const HIDE_DELAY = 400;

const ApiLoader: React.FC<ApiLoaderProps> = ({ 
  isLoading, 
  text = "Loading data..." 
}) => {
  const [visible, setVisible] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const countRef = useRef(0);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const hideLoader = useCallback(() => {
    if (!mountedRef.current) return;
    hideTimeoutRef.current = setTimeout(() => {
      if (countRef.current === 0 && !isLoading && mountedRef.current) {
        setVisible(false);
      }
    }, HIDE_DELAY);
  }, [isLoading]);

  useEffect(() => {
    const originalFetch = window.fetch;
    
    const fetchProxy = async (url: RequestInfo | URL, options?: RequestInit) => {
      countRef.current += 1;
      if (mountedRef.current) {
        setRequestCount(countRef.current);
      }
      
      try {
        const response = await originalFetch(url, options);
        return response;
      } catch (error) {
        throw error;
      } finally {
        countRef.current -= 1;
        if (mountedRef.current) {
          setRequestCount(countRef.current);
        }
      }
    };
    
    window.fetch = fetchProxy as any;
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    if (isLoading || requestCount > 0) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      setVisible(true);
    } else {
      hideLoader();
    }
  }, [isLoading, requestCount, hideLoader]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[99998] pointer-events-none h-[25vh]"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.05) 100%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          maskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 100%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 100%)",
        }}
      />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-3 px-6 py-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/30 dark:border-gray-600/40 transition-all duration-300 animate-slide-up">
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
    </>
  );
};

export default ApiLoader;
