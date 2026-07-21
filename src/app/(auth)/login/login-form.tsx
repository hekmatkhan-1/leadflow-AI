"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { loginAction, forgotPasswordAction } from "@/app/(auth)/actions";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  async function handleLogin(formData: FormData) {
    setIsLoading(true);
    setErrors({});

    formData.append("redirectTo", redirectTo);

    const result = await loginAction(formData);

    if (result?.error) {
      setErrors({ form: result.error });
      toast.error(result.error);
      setIsLoading(false);
    }
    // On success the server action redirects, so we never reach here
  }

  async function handleForgotPassword(formData: FormData) {
    setIsLoading(true);
    setErrors({});

    const result = await forgotPasswordAction(formData);

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
                autoComplete="email"
              />
              {errors.form && (
                <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                  {errors.form}
                </p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" isLoading={isLoading}>
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
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                placeholder="you@company.com"
                required
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
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Sign in
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
