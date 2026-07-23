import { AuthLayout } from "@/components/auth/AuthLayout";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthLayout initialMode="login" />
    </Suspense>
  );
}
