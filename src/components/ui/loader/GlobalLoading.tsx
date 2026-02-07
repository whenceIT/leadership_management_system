"use client";

import React, { useEffect, useState } from "react";

/**
 * GlobalPageLoader - A global loading overlay for Next.js App Router
 * Shows loading on initial page load and during route transitions
 * Uses z-[999999] to be higher than AppHeader's z-99999
 * 
 * Usage: Add to src/app/layout.tsx inside the <body> tag
 */
export function GlobalPageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if page is already loaded
    if (document.readyState === 'complete') {
      setIsLoading(false);
      return;
    }

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 5;
      });
    }, 100);

    // Listen for page load completion
    const handleLoad = () => {
      // Complete the progress
      setProgress(100);
      // Hide loader after a short delay for smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    };

    window.addEventListener('load', handleLoad);

    // Fallback timeout in case load event doesn't fire
    const fallbackTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    }, 3000);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearInterval(progressInterval);
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-white dark:bg-gray-900">
      <FullScreenLoader progress={progress} />
    </div>
  );
}

/**
 * FullScreenLoader - A full-screen loading overlay
 */
interface FullScreenLoaderProps {
  text?: string;
  blur?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  progress?: number;
}

export function FullScreenLoader({
  text = "Loading...",
  blur = true,
  size = "lg",
  progress = 0,
}: FullScreenLoaderProps) {
  const sizeClasses = {
    sm: "w-14 h-14",
    md: "w-16 h-16",
    lg: "w-20 h-20",
    xl: "w-24 h-24",
  };

  const ringSizes = {
    sm: "w-14 h-14 border-3",
    md: "w-16 h-16 border-3",
    lg: "w-20 h-20 border-4",
    xl: "w-24 h-24 border-4",
  };

  const centerDotSizes = {
    sm: "w-3 h-3",
    md: "w-3 h-3",
    lg: "w-4 h-4",
    xl: "w-5 h-5",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  return (
    <div className={`flex flex-col items-center gap-6 ${blur ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm' : ''} p-8 rounded-xl`}>
      {/* Brand loader with rings */}
      <div className="relative">
        {/* Outer ring with pulse */}
        <div className={`${ringSizes[size]} ${sizeClasses[size]} rounded-full border-4 border-gray-100 dark:border-gray-800 animate-pulse`} />
        {/* Inner spinning ring */}
        <div className={`absolute top-0 left-0 ${ringSizes[size]} ${sizeClasses[size]} rounded-full border-4 border-transparent border-t-brand-500 animate-spin`} />
        {/* Center dot with ping */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${centerDotSizes[size]} rounded-full bg-brand-500 animate-ping`} style={{ animationDuration: '1.5s' }} />
      </div>
      
      {/* Loading text */}
      <div className="flex flex-col items-center gap-3">
        <p className={`${textSizes[size]} font-bold text-gray-800 dark:text-white animate-pulse`}>
          {text}
        </p>
        
        {/* Progress bar */}
        {progress > 0 && (
          <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        {/* Animated dots */}
        {!progress && (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * BrandLoader - A professional loader with brand animation
 */
interface BrandLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  text?: string;
}

export function BrandLoader({
  size = "lg",
  showText = true,
  text = "Loading...",
}: BrandLoaderProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  };

  const ringSizes = {
    sm: "w-10 h-10 border-2",
    md: "w-14 h-14 border-3",
    lg: "w-20 h-20 border-4",
    xl: "w-28 h-28 border-4",
  };

  const centerDotSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
    xl: "w-5 h-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  return (
    <div className="flex flex-col items-center gap-4" role="status" aria-label={text}>
      <div className="relative">
        {/* Outer ring */}
        <div className={`${ringSizes.sm} ${sizeClasses.sm} rounded-full border-2 border-gray-100 dark:border-gray-800 animate-pulse`} />
        {/* Inner spinning ring */}
        <div className={`absolute top-0 left-0 ${ringSizes.sm} ${sizeClasses.sm} rounded-full border-2 border-transparent border-t-brand-500 animate-spin`} />
        {/* Center dot */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${centerDotSizes.sm} rounded-full bg-brand-500 animate-ping`} style={{ animationDuration: '1.5s' }} />
      </div>
      
      {showText && (
        <div className="flex flex-col items-center gap-2">
          <p className={`${textSizes.sm} font-semibold text-gray-800 dark:text-white animate-pulse`}>
            {text}
          </p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
      <span className="sr-only">{text}</span>
    </div>
  );
}

/**
 * CircleLoader - Animated circle with multiple rings
 */
interface CircleLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CircleLoader({
  size = "lg",
  className = "",
}: CircleLoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const ringSizes = {
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-2",
    lg: "w-16 h-16 border-3",
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`} role="status">
      {/* Multiple spinning rings */}
      <div className={`${ringSizes[size]} rounded-full border-transparent border-t-brand-500 animate-spin`} style={{ animationDuration: '1s' }} />
      <div className={`absolute ${ringSizes[size]} rounded-full border-transparent border-t-brand-500/30 animate-spin`} style={{ animationDuration: '1.2s', animationDirection: 'reverse' }} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * BarLoader - A horizontal progress bar loader
 */
interface BarLoaderProps {
  width?: string;
  className?: string;
  showPercentage?: boolean;
}

export function BarLoader({
  width = "w-48",
  className = "",
  showPercentage = false,
}: BarLoaderProps) {
  return (
    <div
      className={`${width} flex flex-col gap-1 ${className}`}
      role="status"
    >
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-brand-500 rounded-full animate-loading-bar origin-left" />
      </div>
      {showPercentage && (
        <span className="text-xs text-gray-500 dark:text-gray-400 text-right">Loading...</span>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default GlobalPageLoader;
