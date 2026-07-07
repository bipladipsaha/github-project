"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-border/50 hover:bg-accent"
      >
        Sign Out ({session.user?.username || 'User'})
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("github")}
      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-border/50 hover:bg-accent"
    >
      Sign In
    </button>
  );
}
