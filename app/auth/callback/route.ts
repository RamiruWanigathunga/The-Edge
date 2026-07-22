import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getSafeRedirectPath(nextParam: string | null) {
  if (!nextParam || nextParam === "/") {
    return "/";
  }

  if (!nextParam.startsWith("/") || nextParam.startsWith("//")) {
    return "/";
  }

  return nextParam;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"));
  const supabase = await getSupabaseServerClient();

  if (code && supabase) {
    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;
    } catch (e) {
      console.error("Callback session exchange error:", e);
      return NextResponse.redirect(new URL(`/auth?error=auth-failed`, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
