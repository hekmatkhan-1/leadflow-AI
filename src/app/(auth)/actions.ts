"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(redirectTo);
}

// ---------------------------------------------------------------------------
// Signup
// ---------------------------------------------------------------------------
export async function signupAction(formData: FormData) {
  const companyName = formData.get("companyName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!companyName || !email || !password) {
    return { error: "All fields are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();

  // 1. Create the auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { company_name: companyName },
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

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Check your email for the password reset link." };
}
