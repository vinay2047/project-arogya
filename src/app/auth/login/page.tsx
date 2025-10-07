import { loginWithPassword } from "@/actions/auth.actions";
import GoogleLoginButton from "@/components/GoogleAuthButton";

export default async function LoginPage() {
    return (
        <div>

        <form action={loginWithPassword} className="flex flex-col gap-2">
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">Login</button>
       
        </form>
         <GoogleLoginButton />
        </div>
    );
}