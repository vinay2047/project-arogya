"use server";

import { setUserDetails } from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import RoleSelector from "@/components/RoleSelector";

export default async function OnboardingDetailsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signup");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-100 px-4">
      <Card className="w-full max-w-lg shadow-xl border border-amber-200/60 bg-white/90 backdrop-blur-md rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="text-center mb-4">
          <CardTitle className="text-3xl font-semibold text-amber-900">
            Welcome to Arogya
          </CardTitle>
          <CardDescription className="text-amber-700">
            Let’s set up your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={setUserDetails} className="flex flex-col gap-6">
            {/* Name Input */}
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-amber-900 font-medium">
                What should we call you?
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                required
                className="border-amber-200 focus:border-amber-400 focus:ring-amber-300"
              />
            </div>

            {/* Role Selector */}
            <div className="grid gap-3">
              <Label className="text-amber-900 font-medium mb-1">
                How would you like to use Arogya?
              </Label>
              <RoleSelector />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-amber-600 to-orange-500 text-white hover:from-amber-700 hover:to-orange-600 shadow-md transition-all duration-300"
            >
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
