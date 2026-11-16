"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import {
  ACCOUNTS_CLOSED_MESSAGE,
  areAccountsAvailable,
} from "@/lib/auth-availability";

/**
 * Only allow relative in-app paths as a post-login destination, so the
 * `redirect` query param can't be used to bounce users off-site.
 */
function safeRedirectPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = safeRedirectPath(formData.get("redirectTo") as string | null);

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // No reachable auth backend means no account can be signed into — say so
  // instead of surfacing a network error.
  if (!(await areAccountsAvailable())) {
    return { error: ACCOUNTS_CLOSED_MESSAGE };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }
  } catch {
    return { error: ACCOUNTS_CLOSED_MESSAGE };
  }

  redirect(redirectTo);
}

// ---------------------------------------------------------------------------
// Signup
// ---------------------------------------------------------------------------
export async function signupAction(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const companyName = formData.get("companyName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!fullName || !companyName || !email || !password) {
    return { error: "All fields are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (!(await areAccountsAvailable())) {
    return { error: ACCOUNTS_CLOSED_MESSAGE };
  }

  try {
    const supabase = await createClient();

    // 1. Create the auth user — store full_name + company_name in metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, company_name: companyName },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (!data.user) {
      return { error: "Failed to create account. Please try again." };
    }

    // 2. Insert the business row — use admin client to bypass RLS
    //    (the user may not have a confirmed session yet)
    const admin = createAdminClient();
    const { error: businessError } = await admin.from("businesses").insert({
      id: data.user.id,
      company_name: companyName,
      email,
    });

    if (businessError) {
      // Clean up: delete the auth user since business creation failed
      await admin.auth.admin.deleteUser(data.user.id);
      return {
        error: "Failed to set up your account. Please try again.",
      };
    }
  } catch {
    return { error: ACCOUNTS_CLOSED_MESSAGE };
  }

  redirect("/dashboard");
}

// ---------------------------------------------------------------------------
// Forgot password (reset request)
// ---------------------------------------------------------------------------
export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required." };
  }

  if (!(await areAccountsAvailable())) {
    return { error: ACCOUNTS_CLOSED_MESSAGE };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    });

    if (error) {
      return { error: error.message };
    }
  } catch {
    return { error: ACCOUNTS_CLOSED_MESSAGE };
  }

  return { success: "Check your email for the password reset link." };
}
