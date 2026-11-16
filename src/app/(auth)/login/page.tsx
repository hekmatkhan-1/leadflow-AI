import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { areAccountsAvailable } from "@/lib/auth-availability";

// Availability is checked per request, so this page cannot be prerendered.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const accountsAvailable = await areAccountsAvailable();

  return (
    <Suspense fallback={<div className="text-center text-sm text-gray-500">Loading...</div>}>
      <LoginForm accountsAvailable={accountsAvailable} />
    </Suspense>
  );
}
