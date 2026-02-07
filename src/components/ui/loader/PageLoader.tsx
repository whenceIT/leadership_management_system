"use client";

import React, { useState, useEffect } from "react";

interface PageLoaderProps {
  children: React.ReactNode;
  isLoading?: boolean;
  overlay?: boolean;
  fullScreen?: boolean;
  text?: string;
}

/**
 * PageLoader - A reusable Next.js page loader with Tailwind CSS
 * Shows a full-page or custom overlay with spinner while content loads
 */
export function PageLoader({
  children,
  isLoading: controlledLoading = false,
  overlay = true,
  fullScreen = true,
  text = "Loading...",
}: PageLoaderProps) {
  const [internalLoading, setInternalLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const isLoading = controlledLoading || internalLoading;

  useEffect(() => {
    // Progress simulation
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  useEffect(() => {
    // Automatically stop loading after a minimum delay to prevent flash
    const timer = setTimeout(() => {
      setInternalLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) {
    return <>{children}</>;
  }

  if (overlay) {
    return (
      <div className={fullScreen ? "fixed inset-0 z-50" : "relative"}>
        {/* Full-screen overlay backdrop */}
        <div className={`${fullScreen ? "fixed inset-0" : "absolute inset-0"} flex flex-col items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm`}>
          {/* Animated loader */}
          <div className="flex flex-col items-center gap-6">
            {/* Brand loader with rings */}
            <div className="relative">
              {/* Outer ring */}
              <div className="w-20 h-20 rounded-full border-4 border-gray-100 dark:border-gray-800 animate-pulse" />
              {/* Inner spinning ring */}
              <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-brand-500 animate-ping" style={{ animationDuration: '1.5s' }} />
            </div>
            
            {/* Loading text */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-lg font-semibold text-gray-800 dark:text-white animate-pulse">
                {text}
              </p>
              
              {/* Progress bar */}
              <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {/* Dots animation */}
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Content behind overlay (still rendered but hidden) */}
        <div className="invisible">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <LoaderSpinner size="lg" />
    </div>
  );
}

/**
 * LoaderSpinner - A standalone spinner component
 * Sizes: sm (20px), md (32px), lg (48px), xl (64px)
 */
interface LoaderSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoaderSpinner({
  size = "md",
  className = "",
}: LoaderSpinnerProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const borderSizes = {
    sm: "border-2",
    md: "border-2",
    lg: "border-3",
    xl: "border-4",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${borderSizes[size]} border-gray-200 dark:border-gray-700 border-t-brand-500 rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * InlineLoader - A small inline loading indicator
 */
interface InlineLoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

export function InlineLoader({
  text = "Loading...",
  size = "md",
}: InlineLoaderProps) {
  return (
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
      <LoaderSpinner size={size} />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

/**
 * PulseLoader - A pulse animation loader
 */
interface PulseLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PulseLoader({
  size = "md",
  className = "",
}: PulseLoaderProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className="flex items-center gap-1" role="status">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} bg-brand-500 rounded-full animate-pulse ${
            i === 0 ? "" : i === 1 ? "delay-75" : "delay-150"
          } ${className}`}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * SkeletonLoader - A skeleton loading placeholder
 */
interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function SkeletonLoader({
  className = "",
  variant = "text",
  width,
  height,
}: SkeletonLoaderProps) {
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const style = {
    width: width || (variant === "text" ? "100%" : undefined),
    height: height || (variant === "text" ? undefined : "100%"),
  };

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${variantClasses[variant]} ${className}`}
      style={style}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * SkeletonCard - A complete card skeleton
 */
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-4 mb-4">
        <SkeletonLoader variant="circular" width={48} height={48} />
        <div className="flex-1">
          <SkeletonLoader width="60%" height={16} className="mb-2" />
          <SkeletonLoader width="40%" height={12} />
        </div>
      </div>
      <SkeletonLoader width="100%" height={12} className="mb-2" />
      <SkeletonLoader width="80%" height={12} />
    </div>
  );
}

/**
 * FullScreenLoader - A full-screen loading overlay
 */
interface FullScreenLoaderProps {
  text?: string;
  blur?: boolean;
}

export function FullScreenLoader({
  text = "Loading...",
  blur = true,
}: FullScreenLoaderProps) {
  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${blur ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm' : 'bg-white dark:bg-gray-900'}`}>
      <div className="flex flex-col items-center gap-6">
        {/* Brand loader */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-gray-100 dark:border-gray-800 animate-pulse" />
          <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-transparent border-t-brand-500 animate-spin" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-brand-500 animate-ping" style={{ animationDuration: '1.5s' }} />
        </div>
        
        <div className="flex flex-col items-center gap-3">
          <p className="text-lg font-semibold text-gray-800 dark:text-white animate-pulse">
            {text}
          </p>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageLoader;
