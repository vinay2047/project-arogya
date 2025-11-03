"use client";

import { useState } from "react";
import { signUp } from "@/actions/auth.actions";
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

export default function SignupPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await signUp(formData);

    setLoading(false);

    if (res?.error) setError(res.error);
    else
      setMessage("✅ Check your email to verify your account before continuing.");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-100">
      <Card className="w-full max-w-sm shadow-lg rounded-2xl border border-amber-200 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-semibold text-amber-900">
            Welcome ✨
          </CardTitle>
          <CardDescription className="text-amber-700">
            Create your account below
          </CardDescription>
          <CardAction>
            <Button asChild variant="link" className="text-amber-700 hover:text-amber-900 font-medium">
              <Link href="/auth/login">Already have an account?</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="mt-2">
          {/* ✅ SUCCESS MESSAGE */}
          {message && (
            <Alert className="bg-emerald-50 border-emerald-500 text-emerald-800 mb-4 shadow-sm">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* ❌ ERROR MESSAGE */}
          {error && (
            <Alert variant="destructive" className="mb-4 shadow-sm">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-fadeIn">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-amber-900">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="focus-visible:ring-2 focus-visible:ring-amber-500"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm font-medium text-amber-900">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="focus-visible:ring-2 focus-visible:ring-amber-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white transition-all duration-200 shadow-md"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="flex items-center justify-center text-sm text-amber-700">
              or continue with
            </div>

            <GoogleLoginButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
