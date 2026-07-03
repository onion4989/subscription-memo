import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/** 旧 `/profile` からの互換リダイレクト */
export default function ProfileRedirectPage() {
  redirect(ROUTES.account);
}
