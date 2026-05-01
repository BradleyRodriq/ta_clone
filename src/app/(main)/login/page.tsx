import { Suspense } from "react";
import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16">
          <div className="h-8 w-40 animate-pulse rounded bg-border" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
