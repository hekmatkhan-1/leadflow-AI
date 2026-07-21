"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export function ResetPasswordForm() {
  const router = useRouter();
  const supabaseRef = useRef<SupabaseClient | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  const [isLoading, setIsLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Verify we have a session (from the callback exchange)
  useEffect(() => {
    async function checkSession() {
      const { data } = await getSupabase().auth.getSession();
      if (data.session) {
        setHasSession(true);
      } else {
        setHasSession(false);
      }
    }
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      toast.error("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters." });
      toast.error("Password must be at least 8 characters.");
      setIsLoading(false);
      return;
    }

    const { error } = await getSupabase().auth.updateUser({
      password,
    });

    if (error) {
      setErrors({ form: error.message });
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success("Password updated successfully!");
    router.push("/dashboard");
  }

  if (hasSession === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (hasSession === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Invalid or expired reset link
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Please request a new password reset link.
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/login")}
            >
              Back to login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            LeadFlow AI
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Set a new password for your account
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <CardContent className="flex flex-col gap-4 pt-6">
              <Input
                id="password"
                name="password"
                type="password"
                label="New password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                error={errors.password}
                minLength={8}
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm new password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                error={errors.confirmPassword}
                minLength={8}
              />

              {errors.form && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.form}
                </p>
              )}
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Update password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
