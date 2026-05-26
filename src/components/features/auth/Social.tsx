"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/routes";

export const Social = () => {
    const onClick = (provider: "google" | "github") => {
      signIn(provider, {
        callbackUrl: DEFAULT_LOGIN_REDIRECT,
      });
    };
  
    return (
      <div className="flex w-full items-center gap-x-2">
        <Button
          size="lg"
          className="min-w-0 flex-1 shrink cursor-pointer"
          variant="outline"
          onClick={() => onClick("google")}
        >
          <FcGoogle />
        </Button>
        <Button
          size="lg"
          className="min-w-0 flex-1 shrink cursor-pointer"
          variant="outline"
          onClick={() => onClick("github")}
        >
          <FaGithub />
        </Button>
      </div>
    );
  };