"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthErrorLike = {
  message?: string;
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M21.6 12.23c0-.75-.07-1.47-.19-2.16H12v4.09h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.23c1.89-1.74 2.98-4.3 2.98-7.46Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.96-.89 6.62-2.42l-3.23-2.51c-.9.6-2.04.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A9.99 9.99 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.41 13.9a6 6 0 0 1 0-3.8V7.51H3.07a9.99 9.99 0 0 0 0 8.98l3.34-2.59Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.98c1.47 0 2.79.51 3.83 1.5l2.86-2.86C16.96 3.01 14.7 2 12 2a9.99 9.99 0 0 0-8.93 5.51l3.34 2.59C7.2 7.74 9.4 5.98 12 5.98Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleSignInButton({ 
  callbackNextPath, 
  mode = "signup" 
}: { 
  callbackNextPath?: string;
  mode?: "login" | "signup";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (callbackNextPath) {
        callbackUrl.searchParams.set("next", callbackNextPath);
      }
      // Pass the mode to the callback to handle login-only vs signup logic
      callbackUrl.searchParams.set("mode", mode);

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (authError) {
        throw authError;
      }
    } catch (error: unknown) {
      const authError = error as AuthErrorLike;
      setError(authError.message || "Google sign-in failed.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="group relative flex h-14 w-full items-center justify-center gap-3 rounded-full border border-border bg-background px-5 text-base font-bold text-foreground transition-colors hover:border-muted-foreground/50 hover:bg-secondary disabled:pointer-events-none disabled:opacity-60"
      >
        {/* Removed green gradient hover effect */}
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white">
          <GoogleIcon />
        </span>
        <span className="relative">
          {loading ? "Opening Google..." : mode === "login" ? "Log in with Google" : "Sign up with Google"}
        </span>
        {!loading && (
          <ArrowRight className="relative h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {error && (
        <p className="text-center text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
