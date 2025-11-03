"use client";

import { useState } from "react";
import { createClient } from "../../../supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setMessage(error.message);
    else setMessage("✅ Password updated successfully! You can now log in.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-100 px-4">
      <Card className="w-full max-w-sm shadow-lg rounded-2xl border border-amber-200 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-semibold text-amber-900">
            Reset Password 🔐
          </CardTitle>
          <CardDescription className="text-amber-700">
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <CardContent>
          {message && (
            <Alert className="bg-amber-50 border-amber-400 text-amber-900 mb-4">
              <AlertTitle>Notice</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleResetPassword} className="flex flex-col gap-5 animate-fadeIn">
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm font-medium text-amber-900">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                className="focus-visible:ring-2 focus-visible:ring-amber-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white transition-all duration-200 shadow-md"
            >
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
