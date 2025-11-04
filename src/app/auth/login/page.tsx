import { loginWithPassword } from "@/actions/auth.actions";
import GoogleLoginButton from "@/components/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <Card className="w-full max-w-sm shadow-xl border border-amber-200 rounded-2xl backdrop-blur-sm bg-white/90">
        <CardHeader className="flex flex-col items-center text-center space-y-2">
          <CardTitle className="text-3xl font-extrabold text-amber-900 tracking-tight">
            Welcome Back
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-amber-700 max-w-xs leading-relaxed">
            Sign in to continue your healthcare journey with{" "}
            <span className="font-semibold text-amber-800">Project Arogya</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={loginWithPassword} className="flex flex-col gap-5">
            {/* Email Field */}
            <div className="grid gap-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-amber-900"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@domain.com"
                className="focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                required
              />
            </div>

            {/* Password Field */}
            <div className="grid gap-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-amber-900"
              >
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                required
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold shadow-sm transition-all duration-200"
            >
              Login
            </Button>

            {/* Google Login Button */}
            <div className="relative w-full">
              <GoogleLoginButton
                className="w-full flex items-center justify-center gap-2 border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-medium py-2.5 rounded-md transition-all duration-150"
                iconClassName="w-5 h-5"
              />
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-2">
          <Button
            variant="link"
            className="text-sm text-amber-800 hover:text-amber-900"
            asChild
          >
            <Link href="/auth/forgot-password">Forgot password?</Link>
          </Button>

          <div className="text-sm text-amber-800">
            Don’t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-amber-900 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
