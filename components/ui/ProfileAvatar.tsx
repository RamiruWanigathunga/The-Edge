"use client";

import * as React from "react";

/**
 * Standard Profile Avatar component.
 * Uses custom uploaded profile icons (black for light mode, white for dark mode).
 */
export function ProfileAvatar({ className = "", iconSize = 20 }: { className?: string, iconSize?: number }) {
  return (
    <div 
      className={`relative flex items-center justify-center profile-avatar overflow-hidden ${className}`}
    >
      <img
        src="/images/profile-black.svg"
        alt="Profile"
        className="w-full h-full object-cover dark:hidden"
        loading="eager"
        decoding="sync"
      />
      <img
        src="/images/profile-white.svg"
        alt="Profile"
        className="hidden w-full h-full object-cover dark:block"
        loading="eager"
        decoding="sync"
      />
    </div>
  );
}
