"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { Suspense } from "react";

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthLayout />
    </Suspense>
  );
}
