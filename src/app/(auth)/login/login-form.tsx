"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { loginAction, forgotPasswordAction } from "@/app/(auth)/actions";
import { ACCOUNTS_CLOSED_MESSAGE } from "@/lib/auth-availability";

export function LoginForm({
  accountsAvailable,
}: {
  accountsAvailable: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  async function handleLogin(formData: FormData) {
    // Signing in is impossible while the auth backend is unreachable.
    if (!accountsAvailable) {
      setErrors({ form: ACCOUNTS_CLOSED_MESSAGE });
      return;
    }

    setIsLoading(true);
    setErrors({});

    formData.append("redirectTo", redirectTo);

    let result: { error?: string } | undefined;
    try {
      result = await loginAction(formData);
    } catch {
      result = { error: ACCOUNTS_CLOSED_MESSAGE };
    }

    if (result?.error) {
      setErrors({ form: result.error });
      toast.error(result.error);
      setIsLoading(false);
    }
    // On success the server action redirects, so we never reach here
  }

  async function handleForgotPassword(formData: FormData) {
    if (!accountsAvailable) {
      setErrors({ form: ACCOUNTS_CLOSED_MESSAGE });
      return;
    }

    setIsLoading(true);
    setErrors({});

    let result: { error?: string; success?: string } | undefined;
    try {
      result = await forgotPasswordAction(formData);
    } catch {
      result = { error: ACCOUNTS_CLOSED_MESSAGE };
    }

    if (result?.error) {
      setErrors({ form: result.error });
      toast.error(result.error);
    }

    if (result?.success) {
      toast.success(result.success);
      setIsResetMode(false);
    }

    setIsLoading(false);
  }

  return (
    <>
      {/* Logo / Branding */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          LeadFlow AI
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isResetMode
            ? "Enter your email to reset your password"
            : "Sign in to your account"}
        </p>
      </div>

      <Card>
        {isResetMode ? (
          <form
            ref={formRef}
            action={handleForgotPassword}
            className="flex flex-col gap-4"
          >
            <CardContent className="pt-6">
              <Input
                id="reset-email"
                name="email"
                type="email"
                label="Email address"
                placeholder="you@company.com"
                required
                disabled={!accountsAvailable}
                autoComplete="email"
              />
              {errors.form && (
                <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                  {errors.form}
                </p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={!accountsAvailable}
              >
                Send reset link
              </Button>
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setErrors({});
                }}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Back to login
              </button>
            </CardFooter>
          </form>
        ) : (
          <form
            ref={formRef}
            action={handleLogin}
            className="flex flex-col gap-4"
          >
            <CardContent className="flex flex-col gap-4 pt-6">
              {!accountsAvailable && (
                <div
                  role="status"
                  className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
                >
                  <p className="font-medium">Accounts aren&apos;t open yet</p>
                  <p className="mt-1">{ACCOUNTS_CLOSED_MESSAGE}</p>
                </div>
              )}

              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                placeholder="you@company.com"
                required
                disabled={!accountsAvailable}
                autoComplete="email"
              />

              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  required
                  disabled={!accountsAvailable}
                  autoComplete="current-password"
                />
                <div className="mt-1 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setErrors({});
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {errors.form && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.form}
                </p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={!accountsAvailable}
              >
                {accountsAvailable ? "Sign in" : "Sign-in not open yet"}
              </Button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </>
  );
}
