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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signup");
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Arogya</CardTitle>
          <CardDescription>Let’s set up your account</CardDescription>
        </CardHeader>

        <CardContent>
          <form action={setUserDetails} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">What should we call you?</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>How would you like to use Arogya?</Label>
              <RadioGroup name="role" required className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PATIENT" id="patient" />
                  <Label htmlFor="patient">Patient</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DOCTOR" id="doctor" />
                  <Label htmlFor="doctor">Doctor</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
