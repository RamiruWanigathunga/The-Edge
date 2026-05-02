"use client";

import * as React from "react";

/**
 * Standard Profile Avatar component.
 * Simplified to use neutral grey tones responsive to light/dark mode.
 */
export function ProfileAvatar({ className = "", iconSize = 20 }: { className?: string, iconSize?: number }) {
  return (
    <div 
      className={`rounded-full flex items-center justify-center bg-secondary profile-avatar overflow-hidden ${className}`}
    >
      <svg 
        className="w-full h-full text-muted-foreground/60" 
        viewBox="0 0 100 100" 
        fill="currentColor"
      >
        <circle cx="50" cy="35" r="18" />
        <circle cx="50" cy="112" r="52" />
      </svg>
    </div>
  );
}
