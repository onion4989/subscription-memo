"use client";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  className?: string;
  label?: string;
};

export function SignOutButton({ className, label = "ログアウト" }: SignOutButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: ROUTES.login })}
      className={cn(
        "cursor-pointer rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300",
        className
      )}
    >
      {label}
    </button>
  );
}
