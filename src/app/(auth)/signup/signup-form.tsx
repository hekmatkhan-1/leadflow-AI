"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { signupAction } from "@/app/(auth)/actions";

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setErrors({});

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      toast.error("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    // Remove confirmPassword — server action doesn't need it
    formData.delete("confirmPassword");

    const result = await signupAction(formData);

    if (result?.error) {
      setErrors({ form: result.error });
      toast.error(result.error);
      setIsLoading(false);
    }
    // On success the server action redirects
  }

  function validatePassword(password: string): string | null {
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must include a lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must include a number.";
    return null;
  }

  return (
    <>
      {/* Logo / Branding */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          LeadFlow AI
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create your account to get started
        </p>
      </div>

      <Card>
        <form
          ref={formRef}
          action={handleSubmit}
          className="flex flex-col gap-4"
        >
          <CardContent className="flex flex-col gap-4 pt-6">
            <Input
              id="companyName"
              name="companyName"
              type="text"
              label="Company name"
              placeholder="Acme Inc."
              required
              autoComplete="organization"
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="you@company.com"
              required
              autoComplete="email"
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              minLength={8}
            />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm password"
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

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create account
            </Button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
