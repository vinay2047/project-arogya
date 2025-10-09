"use server";

import { signUp } from "@/actions/auth.actions";
import GoogleLoginButton from "@/components/GoogleAuthButton";

export default async function SignupPage() {
  return (
    <div>

    <form action={signUp} className="flex flex-col gap-2">
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Sign Up</button>
    </form>
    <GoogleLoginButton />
    </div>
  );
}
