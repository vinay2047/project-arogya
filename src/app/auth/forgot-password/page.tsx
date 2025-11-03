"use client";

import { sendResetPasswordEmail } from "@/actions/auth.actions";
import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await sendResetPasswordEmail(email);
      setMessage(result.message);
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-100 px-4">
      <Card className="w-full max-w-sm shadow-lg rounded-2xl border border-amber-200 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-semibold text-amber-900">
            Forgot Password 🔒
          </CardTitle>
          <CardDescription className="text-amber-700">
            Enter your email to receive a reset link
          </CardDescription>
        </CardHeader>

        <CardContent>
          {message && (
            <Alert className="bg-amber-50 border-amber-400 text-amber-900 mb-4">
              <AlertTitle>Notice</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-fadeIn">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-amber-900">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="focus-visible:ring-2 focus-visible:ring-amber-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white transition-all duration-200 shadow-md disabled:opacity-60"
            >
              {isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
