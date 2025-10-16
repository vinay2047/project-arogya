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
    else setMessage("Check your email to verify your account before continuing.");
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Signup with your email</CardDescription>
          <CardAction>
            <Button asChild variant="link">
              <Link href="/auth/login">Already have an account?</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          {message ? (
            <div className="text-center text-green-600 font-medium py-6">
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>

              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
              </Button>

              <GoogleLoginButton />

              {error && (
                <p className="text-red-600 text-sm text-center mt-2">{error}</p>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
