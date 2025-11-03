"use client";

import { signOut } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <form action={signOut}>
      <Button type="submit">Logout</Button>
    </form>
  );
}
