import { SignupForm } from "./signup-form";
import { areAccountsAvailable } from "@/lib/auth-availability";

// Availability is checked per request, so this page cannot be prerendered.
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const accountsAvailable = await areAccountsAvailable();

  return <SignupForm accountsAvailable={accountsAvailable} />;
}
