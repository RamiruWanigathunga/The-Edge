import { AuthLayout } from "@/components/auth/AuthLayout";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthLayout initialMode="signup" />
    </Suspense>
  );
}
