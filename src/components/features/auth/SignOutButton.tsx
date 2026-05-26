"use client";

import { ROUTES } from "@/lib/routes";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: ROUTES.login })}
      className="cursor-pointer py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
    >
      ログアウト
    </button>
  );
}
