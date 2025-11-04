"use client";

import { useState } from "react";
import { loginWithPassword } from "@/actions/auth.actions"; // ✅ correct import
import GoogleLoginButton from "@/components/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // ✅ use the correct function name here
    const res = await loginWithPassword(formData);

    setLoading(false);
    if (res?.error) setError(res.error);
    else setMessage("✅ Logged in successfully! Redirecting...");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-100 px-4">
      <Card className="w-full max-w-md shadow-xl border border-amber-200/60 bg-white/90 backdrop-blur-md rounded-2xl transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-semibold text-amber-900">
            Welcome Back 👋
          </CardTitle>
          <CardDescription className="text-amber-700">
            Log in to continue your consultation journey
          </CardDescription>

          <CardAction>
            <Button asChild variant="link" className="text-amber-800 hover:text-amber-600">
              <Link href="/auth/signup">Don’t have an account? Sign up</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          {/* ✅ Success message */}
          {message && (
            <Alert className="bg-green-50 border-green-500 text-green-800 mb-4">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* ❌ Error message */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-amber-900 font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="doctor@example.com"
                required
                className="border-amber-200 focus:border-amber-400 focus:ring-amber-300"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-amber-900 font-medium">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="border-amber-200 focus:border-amber-400 focus:ring-amber-300"
              />
            </div>

            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-amber-700 hover:text-amber-900 transition-colors"
              >
              Forgot password?
              </Link>
            </div>


            <Button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-amber-600 to-orange-500 text-white hover:from-amber-700 hover:to-orange-600 shadow-md transition-all duration-300"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>

            <div className="flex items-center justify-center my-2">
              <span className="text-sm text-gray-500">or</span>
            </div>

            <GoogleLoginButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
