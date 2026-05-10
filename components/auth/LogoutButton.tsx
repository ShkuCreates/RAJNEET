"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full p-2 rounded-md hover:bg-destructive/10"
    >
      <LogOut size={16} />
      <span>Sign out</span>
    </button>
  );
}
